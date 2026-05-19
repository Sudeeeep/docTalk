from unittest.mock import MagicMock, patch

import chromadb

from services.embedder import embed_and_store

FAKE_VECTOR = [0.1] * 1536


def _fake_embedding_response(chunks):
    mock_response = MagicMock()
    mock_response.data = [MagicMock(embedding=FAKE_VECTOR) for _ in chunks]
    return mock_response


@patch("services.embedder.OpenAI")
def test_stores_correct_number_of_chunks(mock_openai):
    chunks = ["chunk one", "chunk two", "chunk three"]
    mock_openai.return_value.embeddings.create.return_value = _fake_embedding_response(chunks)

    client = chromadb.EphemeralClient()
    result = embed_and_store(chunks, "doc_count_test", chroma_client=client)

    assert result == 3
    collection = client.get_collection("doc_count_test")
    assert collection.count() == 3


@patch("services.embedder.OpenAI")
def test_stores_original_text_alongside_vectors(mock_openai):
    chunks = ["hello world", "goodbye world"]
    mock_openai.return_value.embeddings.create.return_value = _fake_embedding_response(chunks)

    client = chromadb.EphemeralClient()
    embed_and_store(chunks, "doc_text_test", chroma_client=client)

    collection = client.get_collection("doc_text_test")
    stored = collection.get()
    assert stored["documents"] == chunks


@patch("services.embedder.OpenAI")
def test_empty_chunks_returns_zero_without_calling_openai(mock_openai):
    client = chromadb.EphemeralClient()
    result = embed_and_store([], "doc_empty_test", chroma_client=client)

    assert result == 0
    mock_openai.return_value.embeddings.create.assert_not_called()
