import re
import math
import numpy as np

chunks: list[str] = []
_term_index: dict[str, int] = {}
_idf: np.ndarray = np.array([])
_embeddings: list[np.ndarray] = []


def _tokenize(text: str) -> list[str]:
    return re.findall(r'[a-z]+', text.lower())


def _build_idf(corpus: list[list[str]]) -> tuple[dict[str, int], np.ndarray]:
    all_terms = sorted({term for doc in corpus for term in doc})
    term_index = {term: i for i, term in enumerate(all_terms)}
    df = np.zeros(len(all_terms))
    for doc in corpus:
        for term in set(doc):
            if term in term_index:
                df[term_index[term]] += 1
    idf = np.log((len(corpus) + 1) / (df + 1)) + 1
    return term_index, idf


def _vectorize(tokens: list[str], term_index: dict[str, int], idf: np.ndarray) -> np.ndarray:
    vec = np.zeros(len(term_index))
    for token in tokens:
        if token in term_index:
            vec[term_index[token]] += 1
    vec *= idf
    norm = np.linalg.norm(vec)
    return vec / norm if norm > 0 else vec


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


def search_index(query: str, top_k: int = 5) -> list[str]:
    if not _embeddings or not chunks:
        return []
    query_vec = _vectorize(_tokenize(query), _term_index, _idf)
    similarities = [np.dot(query_vec, emb) for emb in _embeddings]
    top_indices = np.argsort(similarities)[::-1][: min(top_k, len(chunks))]
    return [chunks[i] for i in top_indices]


def load_notes(text: str) -> None:
    global chunks, _term_index, _idf, _embeddings
    chunks = chunk_text(text)
    tokenized = [_tokenize(chunk) for chunk in chunks]
    _term_index, _idf = _build_idf(tokenized)
    _embeddings = [_vectorize(tokens, _term_index, _idf) for tokens in tokenized]
