from unittest.mock import patch

from fastapi.testclient import TestClient

from main import app

client = TestClient(app)


def test_health_returns_ok():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_upload_rejects_non_pdf():
    response = client.post(
        "/upload",
        files={"file": ("notes.txt", b"just some text", "text/plain")},
    )
    assert response.status_code == 400
    assert "PDF" in response.json()["detail"]


@patch("main.embed_and_store", return_value=3)
def test_upload_accepts_pdf(mock_embed, single_page_pdf):
    with open(single_page_pdf, "rb") as f:
        response = client.post(
            "/upload",
            files={"file": ("document.pdf", f, "application/pdf")},
        )
    assert response.status_code == 200
    data = response.json()
    assert "filename" in data
    assert "characters" in data
    assert "chunks" in data


@patch("main.answer_question", return_value="The document is about testing.")
@patch("main.retrieve", return_value=["relevant chunk one", "relevant chunk two"])
def test_chat_returns_answer(mock_retrieve, mock_answer):
    response = client.post(
        "/chat",
        json={"doc_id": "abc123", "question": "What is this about?"},
    )
    assert response.status_code == 200
    assert response.json()["answer"] == "The document is about testing."


def test_chat_missing_field_returns_422():
    response = client.post("/chat", json={"doc_id": "abc123"})
    assert response.status_code == 422


@patch("main.retrieve", side_effect=Exception("collection not found"))
def test_chat_unknown_doc_returns_404(mock_retrieve):
    response = client.post(
        "/chat",
        json={"doc_id": "doesnotexist", "question": "anything"},
    )
    assert response.status_code == 404


@patch("main.answer_question", return_value="Answer A")
@patch("main.retrieve", return_value=["chunk"])
def test_history_returns_saved_messages(mock_retrieve, mock_answer):
    client.post("/chat", json={"doc_id": "histdoc", "question": "Question A"})

    response = client.get("/history/histdoc")
    assert response.status_code == 200
    messages = response.json()
    assert len(messages) == 1
    assert messages[0]["question"] == "Question A"
    assert messages[0]["answer"] == "Answer A"


def test_history_returns_empty_list_for_unknown_doc():
    response = client.get("/history/unknowndoc")
    assert response.status_code == 200
    assert response.json() == []


@patch("main.answer_question", side_effect=["First answer", "Second answer"])
@patch("main.retrieve", return_value=["chunk"])
def test_history_preserves_message_order(mock_retrieve, mock_answer):
    client.post("/chat", json={"doc_id": "orderdoc", "question": "First question"})
    client.post("/chat", json={"doc_id": "orderdoc", "question": "Second question"})

    messages = client.get("/history/orderdoc").json()
    assert messages[0]["question"] == "First question"
    assert messages[1]["question"] == "Second question"
