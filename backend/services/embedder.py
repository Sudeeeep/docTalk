import os

import chromadb
from openai import OpenAI

EMBEDDING_MODEL = "text-embedding-3-small"
CHROMA_PATH = "chroma_db"


def embed_and_store(
    chunks: list[str],
    doc_id: str,
    *,
    chroma_client=None,
) -> int:
    if not chunks:
        return 0

    openai_client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

    response = openai_client.embeddings.create(
        input=chunks,
        model=EMBEDDING_MODEL,
    )
    embeddings = [item.embedding for item in response.data]

    if chroma_client is None:
        chroma_client = chromadb.PersistentClient(path=CHROMA_PATH)

    collection = chroma_client.get_or_create_collection(doc_id)
    collection.add(
        ids=[f"{doc_id}_{i}" for i in range(len(chunks))],
        embeddings=embeddings,
        documents=chunks,
    )

    return len(chunks)
