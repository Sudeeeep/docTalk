import json
import os

from openai import OpenAI

CHAT_MODEL = "gpt-4o-mini"

_SYSTEM_PROMPT = """You are a helpful assistant that answers questions about documents.
Answer based only on the provided context.

Respond in JSON with this exact format:
{"answer": "your answer", "found_in_doc": true}

If the context does not contain enough information to answer, respond with:
{"answer": "I couldn't find information about this in the document.", "found_in_doc": false}"""

_GENERAL_SYSTEM_PROMPT = "You are a helpful assistant. Answer the user's question from your general knowledge."


def answer_question(question: str, context_chunks: list[str]) -> dict:
    context = "\n\n".join(context_chunks)
    user_message = f"Context:\n{context}\n\nQuestion: {question}"

    client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
    response = client.chat.completions.create(
        model=CHAT_MODEL,
        messages=[
            {"role": "system", "content": _SYSTEM_PROMPT},
            {"role": "user", "content": user_message},
        ],
        response_format={"type": "json_object"},
    )

    return json.loads(response.choices[0].message.content)


def answer_from_general(question: str) -> dict:
    client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
    response = client.chat.completions.create(
        model=CHAT_MODEL,
        messages=[
            {"role": "system", "content": _GENERAL_SYSTEM_PROMPT},
            {"role": "user", "content": question},
        ],
    )
    return {"answer": response.choices[0].message.content, "found_in_doc": True}
