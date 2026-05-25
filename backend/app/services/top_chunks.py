import os
import pickle
import requests
import numpy as np
from dotenv import load_dotenv

load_dotenv()

# =========================================================
# ENV VARIABLES
# =========================================================

HF_MODEL_NAME = os.getenv(
    "HF_MODEL_NAME",
    "sentence-transformers/all-MiniLM-L6-v2"
)

HF_TOKENS = [
    os.getenv("HF_ACCESS_TOKEN"),
    os.getenv("HF_ACCESS_TOKEN_2")
]

HF_TOKENS = [token for token in HF_TOKENS if token]

if not HF_TOKENS:
    raise ValueError("No HuggingFace access tokens found in .env")



# =========================================================
# LOAD SAVED CHUNK EMBEDDINGS
# =========================================================

def load_embeddings(file_path: str):
    """
    Load precomputed chunk embeddings from pickle file.
    """

    if not os.path.exists(file_path):
        raise FileNotFoundError(
            f"Embeddings file not found: {file_path}"
        )

    with open(file_path, "rb") as f:
        data = pickle.load(f)

    chunks = data["chunks"]

    # Ensure numpy array for fast vector operations
    embeddings = np.array(data["embeddings"])

    model_name = data.get("model_name")

    print(f"\nLoaded {len(chunks)} chunks")
    print(f"Embedding shape: {embeddings.shape}")
    print(f"Model used: {model_name}")

    return chunks, embeddings, model_name


# =========================================================
# GENERATE QUERY EMBEDDING USING HF INFERENCE API
# =========================================================

def embed_query(text: str):

    api_url = (
        f"https://router.huggingface.co/"
        f"hf-inference/models/{HF_MODEL_NAME}"
    )

    last_error = None

    for token in HF_TOKENS:

        headers = {
            "Authorization": f"Bearer {token}"
        }

        try:

            response = requests.post(
                api_url,
                headers=headers,
                json={
                    "inputs": text
                },
                timeout=60
            )

            if response.status_code == 200:

                embedding = response.json()

                if isinstance(embedding[0], list):
                    embedding = embedding[0]

                return np.array(
                    embedding,
                    dtype=np.float32
                )

            else:

                last_error = (
                    f"Status {response.status_code}: "
                    f"{response.text}"
                )

        except Exception as e:
            last_error = str(e)

    raise Exception(
        f"HuggingFace embedding failed.\n{last_error}"
    )
    
# =========================================================
# FAST COSINE SIMILARITY SEARCH
# =========================================================

def top_k_chunks(
    query_embedding,
    chunk_embeddings,
    chunks,
    k=3
):
    """
    Return top-k most similar chunks.
    """

    query_embedding = np.array(
        query_embedding,
        dtype=np.float32
    )

    # Normalize query
    query_norm = np.linalg.norm(query_embedding)

    # Normalize chunk embeddings
    chunk_norms = np.linalg.norm(
        chunk_embeddings,
        axis=1
    )

    # Cosine similarity
    similarities = np.dot(
        chunk_embeddings,
        query_embedding
    ) / (chunk_norms * query_norm + 1e-10)

    # Top K indices
    top_indices = np.argsort(similarities)[::-1][:k]

    results = []

    for idx in top_indices:
        results.append({
            "index": int(idx),
            "score": float(similarities[idx]),
            "chunk": chunks[idx]
        })

    return results

# =========================================================
# LOAD EMBEDDINGS ONCE GLOBALLY
# =========================================================

CURRENT_DIR = os.path.dirname(
    os.path.abspath(__file__)
)

BACKEND_DIR = os.path.abspath(
    os.path.join(CURRENT_DIR, "..", "..")
)

EMBEDDING_PATH = os.path.join(
    BACKEND_DIR,
    "static",
    "profile",
    "embeddings",
    "chunk_embeddings.pkl"
)

CHUNKS, CHUNK_EMBEDDINGS, MODEL_NAME = load_embeddings(
    EMBEDDING_PATH
)


# =========================================================
# PUBLIC FUNCTION FOR RAG RETRIEVAL
# =========================================================

def get_relevant_chunks(
    user_query: str,
    k: int = 3
):
    """
    Main public retrieval function.

    Returns top-k relevant chunk texts.
    """

    formatted_query = (
        "Represent this sentence for searching relevant passages: "
        + user_query
    )

    query_embedding = embed_query(
        formatted_query
    )

    results = top_k_chunks(
        query_embedding=query_embedding,
        chunk_embeddings=CHUNK_EMBEDDINGS,
        chunks=CHUNKS,
        k=k
    )

    return [
        result["chunk"]
        for result in results
    ]
# =========================================================
# MAIN TEST
# =========================================================

def main():
    current_dir = os.path.dirname(os.path.abspath(__file__))

    # go up from: backend/app/services/ -> backend/
    backend_dir = os.path.abspath(os.path.join(current_dir, "..", ".."))

    embedding_path = os.path.join(backend_dir, "static", "profile", "embeddings", "chunk_embeddings.pkl")

    chunks, chunk_embeddings, model_name = load_embeddings(embedding_path)

    query = (
        "Tell me about extracurricular activities during university"
    )

    print("\nGenerating query embedding from HuggingFace API...")

    query_embedding = embed_query(query)

    print(
        f"Query embedding dimension: "
        f"{len(query_embedding)}"
    )

    results = top_k_chunks(
        query_embedding=query_embedding,
        chunk_embeddings=chunk_embeddings,
        chunks=chunks,
        k=3
    )

    print("\n================ TOP 3 RESULTS ================\n")

    for i, result in enumerate(results, start=1):

        print(f"Result #{i}")
        print(f"Index : {result['index']}")
        print(f"Score : {result['score']:.4f}")

        preview = result["chunk"][:500]

        print(f"Chunk :\n{preview}")
        print("\n" + "=" * 50 + "\n")


# =========================================================

if __name__ == "__main__":
    main()