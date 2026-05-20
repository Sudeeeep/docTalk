from unittest.mock import MagicMock, patch

import chromadb

from services.embedder import embed_and_store
from services.retriever import retrieve

FAKE_VECTOR = [0.1] * 1536
DOC_ID = "retriever_test_doc"


def _fake_embedding_response(texts):
    mock = MagicMock()
    mock.data = [MagicMock(embedding=FAKE_VECTOR) for _ in texts]
    return mock


def _seed_collection(client, doc_id, chunks):
    collection = client.get_or_create_collection(doc_id)
    collection.add(
        ids=[f"{doc_id}_{i}" for i in range(len(chunks))],
        embeddings=[FAKE_VECTOR] * len(chunks),
        documents=chunks,
    )


@patch("services.retriever.OpenAI")
def test_returns_relevant_chunks(mock_openai):
    mock_openai.return_value.embeddings.create.return_value = _fake_embedding_response(["q"])

    client = chromadb.EphemeralClient()
    _seed_collection(client, DOC_ID, ["alpha content", "beta content", "gamma content"])

    results = retrieve("what is alpha?", DOC_ID, chroma_client=client)

    assert isinstance(results, list)
    assert len(results) > 0
    assert all(isinstance(r, str) for r in results)


@patch("services.retriever.OpenAI")
def test_respects_n_results(mock_openai):
    mock_openai.return_value.embeddings.create.return_value = _fake_embedding_response(["q"])

    client = chromadb.EphemeralClient()
    _seed_collection(client, DOC_ID + "_n", ["a", "b", "c", "d", "e"])

    results = retrieve("question", DOC_ID + "_n", n_results=2, chroma_client=client)

    assert len(results) == 2
