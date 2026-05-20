import os

import chromadb
from openai import OpenAI

from services.embedder import CHROMA_PATH, EMBEDDING_MODEL


def retrieve(
    question: str,
    doc_id: str,
    *,
    n_results: int = 5,
    chroma_client=None,
) -> list[str]:
    openai_client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

    response = openai_client.embeddings.create(
        input=[question],
        model=EMBEDDING_MODEL,
    )
    question_vector = response.data[0].embedding

    if chroma_client is None:
        chroma_client = chromadb.PersistentClient(path=CHROMA_PATH)

    collection = chroma_client.get_collection(doc_id)
    results = collection.query(
        query_embeddings=[question_vector],
        n_results=min(n_results, collection.count()),
    )

    return results["documents"][0]
