import numpy as np
import voyageai

_client: voyageai.Client | None = None
embeddings_store: list[np.ndarray] = []
chunks: list[str] = []


def _get_client() -> voyageai.Client:
    global _client
    if _client is None:
        _client = voyageai.Client()
    return _client


def chunk_text(text: str, chunk_size: int = 300, overlap: int = 50) -> list[str]:
    words = text.split()
    result = []
    step = chunk_size - overlap
    for i in range(0, max(1, len(words)), step):
        chunk_words = words[i : i + chunk_size]
        if chunk_words:
            result.append(" ".join(chunk_words))
        if i + chunk_size >= len(words):
            break
    return result


def embed_documents(texts: list[str]) -> list[np.ndarray]:
    response = _get_client().embed(texts, model="voyage-3-lite", input_type="document")
    return [np.array(embedding) for embedding in response.embeddings]


def search_index(query: str, top_k: int = 5) -> list[str]:
    if not embeddings_store or not chunks:
        return []
    response = _get_client().embed([query], model="voyage-3-lite", input_type="query")
    query_vec = np.array(response.embeddings[0])
    similarities = [
        np.dot(query_vec, emb) / (np.linalg.norm(query_vec) * np.linalg.norm(emb))
        for emb in embeddings_store
    ]
    top_indices = np.argsort(similarities)[::-1][: min(top_k, len(chunks))]
    return [chunks[i] for i in top_indices]


def load_notes(text: str) -> None:
    global chunks, embeddings_store
    chunks = chunk_text(text)
    embeddings_store = embed_documents(chunks)
