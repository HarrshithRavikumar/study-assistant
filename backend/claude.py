import os
import anthropic
from dotenv import load_dotenv

load_dotenv()

_client: anthropic.Anthropic | None = None

SYSTEM_PROMPT = (
    "You are a study assistant. Answer the user's question using only the context provided. "
    "If the answer cannot be found in the context, say so honestly — do not guess or use outside knowledge."
)


def _get_client() -> anthropic.Anthropic:
    global _client
    if _client is None:
        _client = anthropic.Anthropic(api_key=os.environ["ANTHROPIC_API_KEY"])
    return _client


def generate_answer(context: str, question: str) -> str:
    user_message = f"Context:\n{context}\n\nQuestion:\n{question}"
    message = _get_client().messages.create(
        model="claude-sonnet-4-5",
        max_tokens=1024,
        system=SYSTEM_PROMPT,
        messages=[{"role": "user", "content": user_message}],
    )
    return message.content[0].text


def summarize(text: str) -> str:
    pass
