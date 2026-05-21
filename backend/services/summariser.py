import os

from openai import OpenAI

from services.chat import CHAT_MODEL

MAX_CHARS = 3000

_PROMPT = (
    "Write a 2-3 sentence summary of the following document. "
    "Focus on the main topic, purpose, and key points. "
    "Be concise and factual."
)


def summarise(text: str) -> str:
    truncated = text[:MAX_CHARS]
    client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
    response = client.chat.completions.create(
        model=CHAT_MODEL,
        messages=[
            {"role": "system", "content": _PROMPT},
            {"role": "user", "content": truncated},
        ],
    )
    return response.choices[0].message.content