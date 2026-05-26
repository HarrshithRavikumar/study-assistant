import numpy as np
import anthropic

_client: anthropic.Anthropic | None = None
embeddings_store: list[np.ndarray] = []
chunks: list[str] = []


def _get_client() -> anthropic.Anthropic:
    global _client
    if _client is None:
        _client = anthropic.Anthropic()
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
    response = _get_client().embeddings.create(
        model="voyage-3-lite",
        input=texts,
    )
    return [np.array(item.embedding) for item in response.data]


def search_index(query: str, top_k: int = 5) -> list[str]:
    if not embeddings_store or not chunks:
        return []
    query_response = _get_client().embeddings.create(
        model="voyage-3-lite",
        input=[query],
    )
    query_vec = np.array(query_response.data[0].embedding)
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
