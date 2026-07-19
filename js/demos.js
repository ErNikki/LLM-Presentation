/* ============================================================
   Demo interattive — Sotto il Cofano degli LLM
   Tutte le demo sono illustrative/didattiche (valori simulati),
   pensate per spiegare il concetto, non per replicare un vero modello.
   ============================================================ */

const Demos = (() => {

  /* -------------------------------------------------------
     TOKENIZZAZIONE
     Tokenizer didattico in stile BPE: spezza su spazi/punteggiatura
     e taglia le parole lunghe in sub-word. ID deterministici.
  ------------------------------------------------------- */
  const palette = ['#6c5ce7', '#0a9d92', '#e84393', '#e8730f', '#2e7bd6', '#8e44ad', '#137a63'];

  function tokenize(text) {
    const raw = text.match(/\s+|[A-Za-zÀ-ÿ0-9]+|[^\sA-Za-zÀ-ÿ0-9]/g) || [];
    const tokens = [];
    for (let chunk of raw) {
      if (/^\s+$/.test(chunk)) continue; // gli spazi vengono "attaccati" al token successivo concettualmente
      if (/^[A-Za-zÀ-ÿ0-9]+$/.test(chunk) && chunk.length > 5) {
        // sub-word split per parole lunghe (didattico)
        let i = 0;
        while (i < chunk.length) {
          const piece = chunk.slice(i, i + (i === 0 ? 4 : 3));
          tokens.push(piece);
          i += piece.length;
        }
      } else {
        tokens.push(chunk);
      }
    }
    return tokens;
  }

  function tokenId(tok) {
    let h = 0;
    for (let i = 0; i < tok.length; i++) h = (h * 31 + tok.charCodeAt(i)) % 50257;
    return h;
  }

  function renderTokens() {
    const input = document.getElementById('tokenInput');
    const out = document.getElementById('tokenOutput');
    const stats = document.getElementById('tokenStats');
    if (!input || !out) return;
    const text = input.value;
    const toks = tokenize(text);
    out.innerHTML = '';
    toks.forEach((t, idx) => {
      const c = palette[idx % palette.length];
      const chip = document.createElement('span');
      chip.className = 'token-chip';
      chip.style.background = c + '33';
      chip.style.color = c;
      chip.style.border = `1px solid ${c}`;
      chip.style.animationDelay = (idx * 0.03) + 's';
      const disp = t.replace(/ /g, '·');
      chip.innerHTML = `<span>${escapeHtml(disp)}</span><span class="tid">${tokenId(t)}</span>`;
      out.appendChild(chip);
    });
    const chars = text.length;
    const ratio = toks.length ? (chars / toks.length).toFixed(1) : '0';
    stats.innerHTML = `<span><b>${toks.length}</b> token</span><span><b>${chars}</b> caratteri</span><span>~<b>${ratio}</b> char/token</span>`;
  }

  function initTokenizer() {
    const input = document.getElementById('tokenInput');
    if (!input) return;
    input.addEventListener('input', renderTokens);
    renderTokens();
  }

  function escapeHtml(s) {
    return s.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  }

  /* -------------------------------------------------------
     PREFILL — diagramma del processo:
     token in parallelo → matrice di attention N×N → KV Cache riempita
  ------------------------------------------------------- */
  function el(cls, txt) {
    const d = document.createElement('div');
    d.className = cls;
    if (txt != null) d.textContent = txt;
    return d;
  }

  const pfWords = ['Gli', 'LLM', 'sono', 'molto', 'forti'];

  // matrice query (righe) × key (colonne), causale (j ≤ i)
  function buildAttnMatrix(host, rowLabels) {
    const n = rowLabels.length;
    host.style.gridTemplateColumns = `auto repeat(${n}, 24px)`;
    host.innerHTML = '';
    host.appendChild(el('am-corner', ''));
    for (let j = 0; j < n; j++) host.appendChild(el('am-head', String(j + 1)));
    for (let i = 0; i < n; i++) {
      host.appendChild(el('am-row', rowLabels[i]));
      for (let j = 0; j < n; j++) {
        const c = el('am-cell ' + (j <= i ? 'on' : 'off'), '');
        c.dataset.i = i; c.dataset.j = j;
        host.appendChild(c);
      }
    }
  }

  // striscia KV cache: una colonna (K,V) per token
  function renderCache(host, labels, mode) {
    host.innerHTML = '';
    labels.forEach((lab, i) => {
      let cls = 'kvc full';
      if (mode === 'lit') cls += ' lit';
      if (typeof mode === 'number' && i === mode) cls = 'kvc full fresh';
      const col = el(cls, null);
      col.innerHTML = `<div class="kvc-bars"><i></i><i></i></div><div class="kvc-lab">${escapeHtml(lab)}</div>`;
      host.appendChild(col);
    });
  }

  function initPrefill() {
    const proc = document.getElementById('pfDiagram');
    if (!proc) return;
    buildAttnMatrix(document.getElementById('pfMatrix'), pfWords);
    // cache vuota (placeholder spento) finché non si "riempie"
    const cache = document.getElementById('pfCache');
    renderCache(cache, pfWords.map((_, i) => String(i + 1)), -1);
    cache.querySelectorAll('.kvc').forEach(c => c.classList.remove('full'));
  }

  function playPrefill() {
    const proc = document.getElementById('pfDiagram');
    if (!proc) return;
    const cells = [...proc.querySelectorAll('.am-cell.on')];
    const cols = [...proc.querySelectorAll('#pfCache .kvc')];
    cells.forEach(c => c.classList.remove('fill'));
    cols.forEach(c => c.classList.remove('full'));
    proc.classList.remove('go');
    void proc.offsetWidth; // reflow → ripulse dei token
    proc.classList.add('go');
    // l'intera griglia si riempie come un'unica onda diagonale (= una passata)
    let last = 0;
    cells.forEach(c => {
      const d = 360 + (+c.dataset.i + +c.dataset.j) * 42;
      last = Math.max(last, d);
      setTimeout(() => c.classList.add('fill'), d);
    });
    // poi la cache: tutte le colonne insieme
    setTimeout(() => cols.forEach(c => c.classList.add('full')), last + 220);
  }

  /* -------------------------------------------------------
     DECODE — loop autoregressivo:
     Query (ultimo token) → attende tutta la cache (1 riga) →
     probabilità → scelta → append di una colonna → ripeti
  ------------------------------------------------------- */
  const decCacheStart = ["L'", 'intel…', 'arti…', 'è'];
  const decLoopSteps = [
    { probs: [['uno', 42], ['il', 21], ['ormai', 14], ['già', 10]], pick: 'uno' },
    { probs: [['strumento', 38], ['campo', 24], ['tema', 18], ['aiuto', 12]], pick: 'strumento' },
    { probs: [['del', 44], ['nel', 26], ['per', 15], ['di', 10]], pick: 'del' },
  ];
  let decLoopTimers = [];

  function renderProbs(host, probs, topIdx) {
    host.innerHTML = '';
    probs.forEach(([w, pct], i) => {
      const row = el('dlp' + (i === topIdx ? ' top' : ''), null);
      row.innerHTML = `<span class="dlp-w">"${escapeHtml(w)}"</span><div class="dlp-track"><div class="dlp-bar"></div></div>`;
      host.appendChild(row);
      requestAnimationFrame(() => { row.querySelector('.dlp-bar').style.width = pct + '%'; });
    });
  }

  function playDecodeLoop() {
    const root = document.getElementById('decLoop');
    if (!root) return;
    decLoopTimers.forEach(clearTimeout); decLoopTimers = [];
    const cacheHost = document.getElementById('dlCache');
    const probHost = document.getElementById('dlProbs');
    const qEl = document.getElementById('dlQ');
    const newEl = document.getElementById('dlNew');
    const at = (ms, fn) => decLoopTimers.push(setTimeout(fn, ms));

    let cache = [...decCacheStart];
    renderCache(cacheHost, cache, -1);
    qEl.textContent = 'è';
    newEl.textContent = '＋'; newEl.classList.add('ghost');
    renderProbs(probHost, decLoopSteps[0].probs, -1);

    let t = 500;
    decLoopSteps.forEach(step => {
      const q = cache[cache.length - 1];
      at(t, () => { qEl.textContent = q; qEl.classList.remove('flash'); void qEl.offsetWidth; qEl.classList.add('flash'); });
      at(t + 200, () => renderCache(cacheHost, cache, 'lit'));   // rilegge tutta la cache
      at(t + 450, () => renderProbs(probHost, step.probs, 0));   // distribuzione → top evidenziato
      at(t + 1150, () => { newEl.textContent = '"' + step.pick + '"'; newEl.classList.remove('ghost'); });
      at(t + 1650, () => {                                        // append: la cache cresce di 1
        cache = [...cache, step.pick];
        renderCache(cacheHost, cache, cache.length - 1);
        newEl.textContent = '＋'; newEl.classList.add('ghost');
      });
      t += 2300;
    });
    // ricomincia il loop finché la slide è attiva
    at(t + 700, () => {
      const slide = root.closest('.slide');
      if (slide && slide.classList.contains('active')) playDecodeLoop();
    });
  }

  /* -------------------------------------------------------
     3) DECODE — generazione token-by-token con probabilità
  ------------------------------------------------------- */
  const decodeSteps = [
    [["uno", 42], ["il", 21], ["ormai", 14], ["sempre", 13], ["già", 10]],
    [["strumento", 38], ["campo", 24], ["tema", 18], ["aiuto", 12], ["rischio", 8]],
    [["centrale", 35], ["potente", 27], ["nuovo", 18], ["chiave", 12], ["utile", 8]],
    [["del", 44], ["nel", 26], ["per", 15], ["di", 10], ["oggi", 5]],
    [["nostro", 40], ["futuro", 30], ["mondo", 18], ["lavoro", 8], ["settore", 4]],
    [["tempo", 36], ["digitale", 28], ["moderno", 22], ["umano", 9], [".", 5]],
  ];
  let decodeIdx = 0;

  function renderCandidates(step, chosen = -1) {
    const host = document.getElementById('decodeCandidates');
    if (!host) return;
    host.innerHTML = '';
    step.forEach(([word, pct], i) => {
      const row = document.createElement('div');
      row.className = 'cand' + (i === chosen ? ' chosen' : '');
      row.innerHTML = `
        <div class="cand-label">"${word}"</div>
        <div class="cand-bar-wrap"><div class="cand-bar" style="width:0%">${pct}%</div></div>`;
      host.appendChild(row);
      requestAnimationFrame(() => {
        row.querySelector('.cand-bar').style.width = pct + '%';
      });
    });
  }

  function initDecode() {
    const btn = document.getElementById('decodeBtn');
    const reset = document.getElementById('decodeReset');
    const out = document.getElementById('decodeOutput');
    if (!btn) return;

    renderCandidates(decodeSteps[0]);

    btn.addEventListener('click', () => {
      if (decodeIdx >= decodeSteps.length) return;
      const step = decodeSteps[decodeIdx];
      // scegli il token: campionamento pesato (il più probabile vince quasi sempre)
      const chosen = weightedPick(step);
      renderCandidates(step, chosen);
      const word = step[chosen][0];
      const tok = document.createElement('span');
      tok.className = 'decode-token';
      tok.textContent = (word === '.' ? '' : ' ') + word;
      out.appendChild(tok);
      decodeIdx++;
      if (decodeIdx >= decodeSteps.length) {
        btn.textContent = '✓ Sequenza completata';
        btn.disabled = true;
      } else {
        setTimeout(() => renderCandidates(decodeSteps[decodeIdx]), 650);
      }
    });

    reset.addEventListener('click', () => {
      decodeIdx = 0;
      out.innerHTML = '<span class="decode-prompt">L\'intelligenza artificiale è…</span>';
      btn.textContent = '▶ Genera prossimo token';
      btn.disabled = false;
      renderCandidates(decodeSteps[0]);
    });
  }

  function weightedPick(step) {
    const total = step.reduce((a, [, p]) => a + p, 0);
    let r = Math.random() * total;
    for (let i = 0; i < step.length; i++) { r -= step[i][1]; if (r <= 0) return i; }
    return 0;
  }

  /* -------------------------------------------------------
     4) TEMPERATURE & TOP-P
     Mostra come la distribuzione di probabilità si modella.
  ------------------------------------------------------- */
  const baseLogits = [
    { w: '"strumento"', l: 4.2 },
    { w: '"futuro"',    l: 3.5 },
    { w: '"rischio"',   l: 2.8 },
    { w: '"gioco"',     l: 2.0 },
    { w: '"colore"',    l: 1.1 },
    { w: '"banana"',    l: 0.3 },
  ];

  function softmax(logits, temp) {
    const t = Math.max(temp, 0.01);
    const scaled = logits.map(x => x / t);
    const max = Math.max(...scaled);
    const exps = scaled.map(x => Math.exp(x - max));
    const sum = exps.reduce((a, b) => a + b, 0);
    return exps.map(e => e / sum);
  }

  function renderTemp() {
    const tempSlider = document.getElementById('tempSlider');
    const toppSlider = document.getElementById('toppSlider');
    const chart = document.getElementById('tempChart');
    const readout = document.getElementById('tempReadout');
    if (!tempSlider) return;

    const temp = +tempSlider.value / 100;
    const topp = +toppSlider.value / 100;
    document.getElementById('tempVal').textContent = temp.toFixed(2);
    document.getElementById('toppVal').textContent = topp.toFixed(2);

    let probs = softmax(baseLogits.map(x => x.l), temp);
    // applica top-p: tieni i token (ordinati) finché la cumulata < topp
    const order = probs.map((p, i) => [p, i]).sort((a, b) => b[0] - a[0]);
    const keep = new Set();
    let cum = 0;
    for (const [p, i] of order) {
      keep.add(i);
      cum += p;
      if (cum >= topp) break;
    }

    chart.innerHTML = '';
    const maxP = Math.max(...probs);
    baseLogits.forEach((tok, i) => {
      const col = document.createElement('div');
      const alive = keep.has(i);
      col.className = 'temp-col' + (alive ? '' : ' dim');
      const h = alive ? (probs[i] / maxP) * 100 : 2;
      col.innerHTML = `
        <span class="temp-col-pct">${(probs[i] * 100).toFixed(0)}%</span>
        <div class="temp-col-bar" style="height:${h}%"></div>
        <span class="temp-col-label">${tok.w}</span>`;
      chart.appendChild(col);
    });

    let mood;
    if (temp < 0.3) mood = 'quasi <b>deterministico</b> → sceglie quasi sempre il token più probabile. Preciso, ripetitivo.';
    else if (temp < 0.9) mood = '<b>bilanciato</b> → un buon compromesso tra coerenza e varietà. Default tipico.';
    else mood = 'molto <b>creativo</b> → la distribuzione si appiattisce, anche token improbabili diventano possibili.';
    const kept = keep.size;
    readout.innerHTML = `Temperatura ${temp.toFixed(2)}: ${mood}<br>Top-P ${topp.toFixed(2)}: il modello considera solo <b>${kept}</b> token su ${baseLogits.length} (i meno probabili sono scartati).`;
  }

  function initTemp() {
    const t = document.getElementById('tempSlider');
    const p = document.getElementById('toppSlider');
    if (!t) return;
    t.addEventListener('input', renderTemp);
    p.addEventListener('input', renderTemp);
    renderTemp();
  }

  /* -------------------------------------------------------
     RNN vs SELF-ATTENTION — confronto interattivo "Play"
     RNN: avanza un token alla volta, la memoria iniziale sbiadisce.
     Self-Attention: tutte le parole si illuminano insieme + link all-pairs.
  ------------------------------------------------------- */
  const rvaWords = ["Il", "gatto", "che", "dormiva", "era", "molto", "vecchio"];
  let rvaTimer = null;

  function buildRvaWords(host, cls) {
    host.innerHTML = '';
    return rvaWords.map(w => {
      const s = document.createElement('span');
      s.className = 'rva-word';
      s.textContent = w;
      host.appendChild(s);
      return s;
    });
  }

  function buildAttnLines(svg, words) {
    svg.innerHTML = '';
    const box = svg.getBoundingClientRect();
    const centers = words.map(el => {
      const r = el.getBoundingClientRect();
      return { x: r.left - box.left + r.width / 2, y: r.top - box.top + r.height / 2 };
    });
    const lines = [];
    for (let i = 0; i < centers.length; i++) {
      for (let j = i + 1; j < centers.length; j++) {
        const ln = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        ln.setAttribute('x1', centers[i].x); ln.setAttribute('y1', centers[i].y);
        ln.setAttribute('x2', centers[j].x); ln.setAttribute('y2', centers[j].y);
        svg.appendChild(ln);
        lines.push(ln);
      }
    }
    return lines;
  }

  function initRnnVsAttention() {
    const playBtn = document.getElementById('rvaPlay');
    if (!playBtn) return;
    const resetBtn = document.getElementById('rvaReset');
    const rnnHost = document.getElementById('rvaRnnWords');
    const attnHost = document.getElementById('rvaAttnWords');
    const svg = document.getElementById('rvaAttnSvg');
    const rnnStatus = document.getElementById('rvaRnnStatus');
    const attnStatus = document.getElementById('rvaAttnStatus');

    const rnnEls = buildRvaWords(rnnHost);
    const attnEls = buildRvaWords(attnHost);

    function reset() {
      if (rvaTimer) { clearInterval(rvaTimer); rvaTimer = null; }
      rnnEls.forEach(e => { e.className = 'rva-word'; e.style.opacity = ''; });
      attnEls.forEach(e => e.className = 'rva-word');
      svg.innerHTML = '';
      rnnStatus.className = 'rva-status'; rnnStatus.textContent = 'in attesa…';
      attnStatus.className = 'rva-status'; attnStatus.textContent = 'in attesa…';
      playBtn.disabled = false; playBtn.textContent = '▶ Play — confronta';
    }

    function play() {
      reset();
      playBtn.disabled = true; playBtn.textContent = '⏳ in corso…';

      // --- RNN: stepping sequenziale ---
      let i = 0;
      rvaTimer = setInterval(() => {
        rnnEls.forEach((e, k) => {
          e.classList.remove('head');
          if (k < i) {
            e.classList.add('done');
            // memoria corta: i token più vecchi sbiadiscono
            e.style.opacity = Math.max(0.25, 1 - (i - k) * 0.18);
          }
        });
        if (i < rnnEls.length) {
          rnnEls[i].classList.add('head');
          rnnStatus.className = 'rva-status bad-txt';
          rnnStatus.innerHTML = `Passo <b>${i + 1}</b> / ${rnnEls.length} — leggo «${rvaWords[i]}»`;
          i++;
        } else {
          clearInterval(rvaTimer); rvaTimer = null;
          rnnEls.forEach(e => e.classList.remove('head'));
          rnnStatus.className = 'rva-status bad-txt';
          rnnStatus.innerHTML = `✓ <b>${rnnEls.length} passi</b> sequenziali — la GPU aspetta`;
          playBtn.disabled = false; playBtn.textContent = '▶ Play — confronta';
        }
      }, 600);

      // --- Self-Attention: tutto insieme, quasi subito ---
      setTimeout(() => {
        const lines = buildAttnLines(svg, attnEls);
        attnEls.forEach(e => e.classList.add('lit'));
        requestAnimationFrame(() => lines.forEach(l => l.classList.add('show')));
        attnStatus.innerHTML = `✓ <b>1 passo</b> — tutte le 7 parole insieme`;
      }, 700);
    }

    playBtn.addEventListener('click', play);
    resetBtn.addEventListener('click', reset);
  }

  /* -------------------------------------------------------
     Rete neurale — forward pass animato (cane / non cane)
  ------------------------------------------------------- */
  let cnnRun = null;
  function initCnn() {
    const svg = document.getElementById('cnnNet');
    if (!svg) return;
    const btn   = document.getElementById('cnnRun');
    const e0    = [...svg.querySelectorAll('.edge.e0')];
    const e1    = [...svg.querySelectorAll('.edge.e1')];
    const ni    = [...svg.querySelectorAll('.node.ni')];
    const nh    = [...svg.querySelectorAll('.node.nh')];
    const dog   = svg.querySelector('#outDog');
    const not   = svg.querySelector('#outNot');
    const pDog  = svg.querySelector('#pDog');
    const pNot  = svg.querySelector('#pNot');
    let timers = [];

    function reset() {
      timers.forEach(clearTimeout); timers = [];
      [...e0, ...e1, ...ni, ...nh].forEach(el => el.classList.remove('fire'));
      [dog, not].forEach(n => n.classList.remove('fire', 'win', 'lose'));
      pDog.textContent = ''; pNot.textContent = '';
    }

    function run() {
      reset();
      const at = (ms, fn) => timers.push(setTimeout(fn, ms));
      at(300,  () => ni.forEach(n => n.classList.add('fire')));
      at(700,  () => e0.forEach(el => el.classList.add('fire')));
      at(1150, () => nh.forEach(n => n.classList.add('fire')));
      at(1550, () => e1.forEach(el => el.classList.add('fire')));
      at(2050, () => {
        dog.classList.add('fire', 'win');
        not.classList.add('lose');
        pDog.textContent = '0.92';
        pNot.textContent = '0.08';
      });
    }

    if (btn) btn.addEventListener('click', run);
    cnnRun = run;
  }
  function playCnn() { if (cnnRun) cnnRun(); }

  /* ---------- init all ---------- */
  function init() {
    initTokenizer();
    initPrefill();
    initDecode();
    initTemp();
    initCnn();
  }

  return { init, playPrefill, playDecodeLoop, playCnn };
})();
