from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

import rag
from rag import load_notes, search_index
from claude import generate_answer

app = FastAPI(title="Study Assistant Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "https://study-assistant-zeta.vercel.app"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class UploadRequest(BaseModel):
    text: str


class AskRequest(BaseModel):
    question: str


@app.get("/")
async def health_check():
    return {"status": "ok"}


@app.post("/upload")
async def upload(body: UploadRequest):
    load_notes(body.text)
    return {"message": "Notes loaded", "chunks": len(rag.chunks)}


@app.post("/ask")
async def ask(body: AskRequest):
    if not rag.chunks:
        raise HTTPException(status_code=400, detail="No notes loaded. POST to /upload first.")
    sources = search_index(body.question, top_k=3)
    context = "\n\n".join(sources)
    answer = generate_answer(context, body.question)
    return {"answer": answer, "sources": sources}
