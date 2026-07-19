# RAG — Retrieval Augmented Generation

Guida completa al **RAG (Retrieval Augmented Generation)**: un'architettura AI che combina recupero di informazioni e generazione di testo per rispondere a domande usando documenti privati o aggiornati.

- Fonti
    - **RAG Crash Course for Beginners**
        
        [RAG Crash Course for Beginners](https://www.youtube.com/watch?v=swvzKSOEluc)
        
- ## Cos'è il RAG?
    
    **RAG** sta per **Retrieval-Augmented Generation**.
    
    È un'architettura software che risolve uno dei limiti principali degli LLM (Large Language Models): la conoscenza statica derivante solo dal training. Invece di rispondere basandosi esclusivamente su ciò che ha imparato in fase di addestramento, un sistema RAG **recupera dinamicamente informazioni da fonti esterne** prima di generare la risposta.
    
    > Un LLM "puro" è come uno studente che ha studiato tantissimo ma non può aprire nessun libro durante l'esame. Il RAG gli permette di consultare una biblioteca durante l'esame.
    > 
    
    **Quando non usare il RAG?**
    
    - Quando le informazioni sono già nel training dell'LLM e non cambiano nel tempo
    - Quando non si hanno documenti da indicizzare
    - Quando la latenza di risposta è critica
- ## Come funziona? La Pipeline RAG
    
    La pipeline RAG si divide in due macro-fasi distinte.
    
    ### Fase 1 — Indicizzazione (offline, si fa una volta)
    
    1. Si prendono i **documenti privati** (PDF, Word, pagine web, ecc.)
    2. Si applicano strategie di **chunking** per dividerli in pezzi più piccoli
    3. Ogni chunk viene trasformato in un **vettore numerico** tramite un Embedding Model
    4. I vettori vengono salvati in un **Vector Database**
    
    ### Fase 2 — Retrieval + Generation (online, ad ogni domanda)
    
    1. L'utente scrive un prompt
    2. Il prompt viene trasformato in un vettore tramite lo stesso Embedding Model
    3. Il vettore della query viene confrontato con i vettori nel Vector DB
    4. I chunk più simili (Top-K) vengono recuperati
    5. I chunk vengono inseriti nel prompt come **contesto** (Augmented Prompt)
    6. L'LLM legge il contesto e **genera** la risposta finale
- ## Chunking
    
    ### Cos'è il Chunking?
    
    Il **chunking** è il processo di divisione di un documento lungo in pezzi più piccoli (chunk) prima di calcolarne gli embedding.
    
    **Perché è necessario?**
    
    - Gli Embedding Model hanno un **limite di token** in input (es. 512 o 8192 token): un PDF di 200 pagine non ci sta
    - Un singolo vettore che rappresenta 200 pagine sarebbe troppo generico e poco preciso
    - Più il chunk è piccolo e focalizzato, più il vettore è preciso nella ricerca
    
    ### Trade-off nella dimensione dei chunk
    
    |  | Chunk piccoli (100–300 token) | Chunk grandi (500–2000 token) |
    | --- | --- | --- |
    | Precisione del retrieval | Alta | Bassa |
    | Rischio di taglio concetti | Alto | Basso |
    | Contesto passato all'LLM | Scarso | Ricco |
    | Uso ideale | Q&A preciso | Riassunti, analisi |
    
    ### Overlap (finestra scorrevole)
    
    Per evitare di tagliare concetti a cavallo tra due chunk, si usa la **sliding window**: ogni chunk condivide alcuni token con il successivo.
    
    ```python
    def chunk_document(text, chunk_size=500, overlap=50):
        """Split document into overlapping chunks"""
        chunks = []
        start = 0
        while start < len(text):
            end = start + chunk_size
            chunk = text[start:end]
            chunks.append(chunk.strip())
            start = end - overlap  # Overlap for context
        return chunks
    ```
    
- ## Ricerca per Parole Chiave (Keyword Search)
    
    ### Cos'è?
    
    La **keyword search** è il metodo classico di ricerca: si cerca una corrispondenza **letterale** tra le parole della query e quelle nei documenti.
    
    ### Algoritmi principali
    
    - **TF-IDF** (Term Frequency – Inverse Document Frequency): pesa ogni parola in base a quanto è frequente nel documento ma rara nel corpus
    - **BM25**: evoluzione di TF-IDF, più robusta e usata nei motori di ricerca moderni (es. Elasticsearch)
    
    ### Vantaggi e limiti
    
    **Vantaggi:**
    
    - Molto preciso per termini tecnici, acronimi, codice, nomi propri
    - Semplice da implementare (indice invertito)
    - Nessuna GPU necessaria
    
    **Limiti:**
    
    - Non capisce il significato: cercare *"volo economico"* non troverà un documento che parla di *"tariffa low-cost"*
    - Sensibile a sinonimi, errori di battitura, variazioni linguistiche
- ## Ricerca Semantica (Semantic Search)
    
    ### Cos'è?
    
    La **ricerca semantica** non confronta le parole letteralmente, ma confronta il **significato** dei testi. Due frasi che usano parole diverse ma vogliono dire la stessa cosa risulteranno vicine nello spazio vettoriale.
    
    ### Come funziona?
    
    1. Un **Embedding Model** riceve il testo in input
    2. Produce un **vettore numerico** ad alta dimensionalità (es. 768 o 1536 numeri)
    3. Testi semanticamente simili producono vettori geometricamente vicini
    4. La vicinanza si misura tramite **Dot Product** o **Cosine Similarity**
    
    ### Il Dot Product e la Normalizzazione
    
    La cosine similarity tra due vettori **A** e **B** è:
    
    `cosine_similarity = (A · B) / (|A| × |B|)`
    
    Se i vettori sono **normalizzati a lunghezza 1** (unit vectors), la formula si semplifica a:
    
    `cosine_similarity = A · B`
    
    Il dot product diventa equivalente alla cosine similarity. Per questo la maggior parte degli embedding model normalizza già i vettori in output: il dot product è computazionalmente più veloce.
    
    **Risultato:** un valore tra **-1 e 1** — più è vicino a 1, più i due testi sono semanticamente simili.
    
    ### Keyword vs Semantica
    
    |  | Keyword (BM25) | Semantic Search |
    | --- | --- | --- |
    | Meccanismo | Match esatto di parole | Similarità vettoriale |
    | Capisce sinonimi | ❌ | ✅ |
    | Preciso su codice/acronimi | ✅ | ❌ |
    | Infrastruttura | Indice invertito | Vector DB |
    | Uso ideale | Termini tecnici noti | Query in linguaggio naturale |
    
    ### Hybrid Search
    
    In produzione si combina spesso entrambi gli approcci. Le due tecniche principali di fusione sono:
    
    - **Score-based fusion**: si normalizzano gli score su scala [0,1] e si combinano con una media pesata (`α × BM25 + (1-α) × semantic`)
    - **Reciprocal Rank Fusion (RRF)**: usa la posizione (rank) nelle due liste, non il valore dello score — più robusta e non richiede normalizzazione
- ## Embedding Models
    
    ### Cos'è un Embedding Model?
    
    Un **Embedding Model** è una rete neurale che prende in input del testo e produce in output un **vettore numerico** (array di float ad alta dimensionalità).
    
    L'obiettivo è che il vettore catturi il **significato semantico** del testo, in modo che testi simili producano vettori simili nello spazio geometrico.
    
    ### Esempi di modelli popolari
    
    | Modello | Provider | Dimensioni | Note |
    | --- | --- | --- | --- |
    | `text-embedding-3-small` | OpenAI | 1536 | Veloce, economico |
    | `text-embedding-3-large` | OpenAI | 3072 | Alta qualità |
    | `nomic-embed-text` | Nomic AI | 768 | Open source, locale |
    | `mxbai-embed-large` | MixedBread | 1024 | Ottimo per uso locale |
    
    ### Come si usa in pratica
    
    ```python
    import openai
    
    def get_openai_embeddings(texts):
        response = openai.embeddings.create(
            model="text-embedding-3-small",
            input=texts
        )
        return [data.embedding for data in response.data]
    
    # Genera embedding per i chunk
    embeddings = get_openai_embeddings(sentences)
    ```
    
    ### Punto chiave
    
    Lo **stesso identico modello** deve essere usato sia per embeddare i documenti (fase di indicizzazione) che per embeddare la query dell'utente (fase di retrieval). Se si cambiano modelli, tutti i vettori nel Vector DB devono essere ricalcolati.
    
- ## Vector Database
    
    ### Cos'è?
    
    Un **Vector Database** è un database specializzato nel salvare e cercare vettori numerici in modo efficiente. È il cuore del sistema RAG: permette di trovare rapidamente i chunk semanticamente più vicini a una query tra milioni di vettori.
    
    ### Cosa viene salvato?
    
    Nel vector DB non viene salvato il documento originale intero, ma ogni **chunk** separatamente. Ogni record contiene:
    
    - **Il vettore (embedding)**: l'array di numeri usato per la ricerca per similarità
    - **Il payload (testo del chunk)**: il testo originale leggibile — necessario per passarlo all'LLM
    - **I metadati**: `doc_id`, numero pagina, autore, data, `chunk_index` — utili per filtrare
    
    ### Esempio con ChromaDB
    
    ```python
    import chromadb
    
    client = chromadb.Client()
    collection = client.create_collection("policies")
    
    for i, policy in enumerate(policies):
        collection.add(
            documents=[policy],
            ids=[f"policy_{i}"]
        )
    ```
    
    ### Vector DB popolari
    
    | DB | Self-hosted | Cloud | Note |
    | --- | --- | --- | --- |
    | **ChromaDB** | ✅ | ✅ | Semplicissimo, ottimo per iniziare |
    | **Milvus** | ✅ | ✅ | Produzione, scalabile |
    | **Qdrant** | ✅ | ✅ | Performante, Rust-based |
    | **Weaviate** | ✅ | ✅ | Supporto ibrido nativo |
    | **pgvector** | ✅ | ❌ | Estensione PostgreSQL |
    
    ### Come funziona la ricerca (ANN)
    
    I Vector DB non fanno una comparazione esatta con tutti i vettori (sarebbe troppo lento). Usano algoritmi di **Approximate Nearest Neighbor (ANN)** come **HNSW** (Hierarchical Navigable Small World) per trovare i K vettori più vicini in millisecondi anche su milioni di record.
    
- ## La Pipeline RAG Completa
    
    ### Flusso completo end-to-end
    
    ```
    [Documento PDF/Word]
            ↓
       [Chunking]
      (500 token, overlap 50)
            ↓
      [Embedding Model]
      (ogni chunk → vettore)
            ↓
       [Vector DB]
     (salvataggio chunk + vettori)
    
    ━━━━━━━━━━━━━━━━━━━━━━━━━━
    
      [Prompt Utente]
            ↓
      [Embedding Model]
      (query → vettore)
            ↓
       [Vector DB]
      (ricerca Top-K chunk simili)
            ↓
      [Augmented Prompt]
      "Contesto: [chunk 1][chunk 2]...
       Domanda: ..."
            ↓
         [LLM]
            ↓
      [Risposta finale]
    ```
    
    ### Quanti chunk passare all'LLM?
    
    Dipende da due fattori:
    
    - **Context window dell'LLM**: il numero massimo di token accettati in un singolo prompt (da 8k a 200k token nei modelli moderni)
    - **Parametro Top-K**: quanti chunk recuperare dal vector DB (tipicamente 3–10)
    
    Passare troppi chunk è controproducente: l'LLM rischia il fenomeno **"Lost in the Middle"** (ignora le informazioni al centro di testi lunghissimi) e il costo per token aumenta.
    
    ### Il ruolo dell'LLM nella fase di Generation
    
    L'LLM non serve per "scoprire" la risposta (che già si trova nei chunk), ma per:
    
    - **Sintetizzare** informazioni da chunk multipli in una risposta coerente
    - **Adattare il formato** (bullet point, tono amichevole, tabella, ecc.)
    - **Filtrare il rumore** (intestazioni, testo irrilevante nei chunk)
    - **Ragionare** su informazioni distribuite in più documenti
    
    ### RAG Privato (Local RAG)
    
    È possibile eseguire tutta la pipeline localmente, senza inviare dati a server esterni, usando:
    
    - **Ollama**: per eseguire LLM ed Embedding Model in locale (Llama 3, Mistral, ecc.)
    - **ChromaDB / Qdrant**: come vector DB locale
    - **RAGFlow / Kotaemon**: applicazioni open-source con interfaccia grafica pronte all'uso

![RAG pipeline.png](RAG%20%E2%80%94%20Retrieval%20Augmented%20Generation/RAG_pipeline.png)

![RAG pipeline 2.png](RAG%20%E2%80%94%20Retrieval%20Augmented%20Generation/RAG_pipeline_2.png)