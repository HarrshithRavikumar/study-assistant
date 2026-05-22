import numpy as np
import faiss
from sentence_transformers import SentenceTransformer

model: SentenceTransformer | None = None
index: faiss.Index | None = None
chunks: list[str] = []


def _get_model() -> SentenceTransformer:
    global model
    if model is None:
        model = SentenceTransformer("all-MiniLM-L6-v2")
    return model


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


def embed_documents(texts: list[str]) -> np.ndarray:
    return _get_model().encode(texts, convert_to_numpy=True, show_progress_bar=False)


def build_index(embeddings: np.ndarray) -> None:
    global index
    dim = embeddings.shape[1]
    index = faiss.IndexFlatL2(dim)
    index.add(embeddings.astype(np.float32))


def search_index(query: str, top_k: int = 5) -> list[str]:
    if index is None or not chunks:
        return []
    query_vec = _get_model().encode([query], convert_to_numpy=True).astype(np.float32)
    k = min(top_k, index.ntotal)
    _, indices = index.search(query_vec, k)
    return [chunks[i] for i in indices[0] if 0 <= i < len(chunks)]


def load_notes(text: str) -> None:
    global chunks
    chunks = chunk_text(text)
    embeddings = embed_documents(chunks)
    build_index(embeddings)
