 # AI Study Assistant 
 
Upload your notes and ask questions — get answers grounded in what you actually studied.

**Live demo:** https://study-assistant-zeta.vercel.app

## How it works

1. You paste your notes and hit Upload. The backend splits them into overlapping chunks and builds a TF-IDF index over the words.
2. When you ask a question, the query is vectorized the same way and compared against all chunks using cosine similarity. The top matching chunks are retrieved.
3. Those chunks are sent to the Claude API as context, and Claude generates an answer grounded in your notes.
4. The answer is returned alongside the source chunks so you can see exactly what it was based on.

## Tech Stack

- **Backend:** FastAPI, Python, TF-IDF search (stdlib + numpy), Claude API
- **Frontend:** React, Vite
- **Hosting:** Render (backend), Vercel (frontend)

## Running locally

**Backend**

```bash
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
export ANTHROPIC_API_KEY=your_key_here
uvicorn main:app --reload
```

**Frontend**

```bash
cd frontend
npm install
npm run dev
```

The frontend dev server runs on http://localhost:5173 and the backend on http://localhost:8000.

## Features:

- **Note upload** — paste any plain-text notes and index them instantly
- **Semantic search** — TF-IDF retrieval finds the most relevant passages for your question
- **Context-grounded answers** — Claude answers using only your notes, not general knowledge
- **Source highlighting** — every answer shows the exact chunks it was drawn from

## Links:

- GitHub: https://github.com/HarrshithRavikumar/study-assistant
- Live: https://study-assistant-zeta.vercel.app
