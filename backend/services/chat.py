import os

from openai import OpenAI

CHAT_MODEL = "gpt-4o-mini"

_SYSTEM_PROMPT = (
    "You are a helpful assistant. Answer the question based only on the context below. "
    "If the answer is not in the context, say \"I don't know based on the provided document.\""
)


def answer_question(question: str, context_chunks: list[str]) -> str:
    context = "\n\n".join(context_chunks)
    user_message = f"Context:\n{context}\n\nQuestion: {question}"

    client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
    response = client.chat.completions.create(
        model=CHAT_MODEL,
        messages=[
            {"role": "system", "content": _SYSTEM_PROMPT},
            {"role": "user", "content": user_message},
        ],
    )

    return response.choices[0].message.content
