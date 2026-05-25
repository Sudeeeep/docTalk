from unittest.mock import MagicMock, patch

from services.chat import answer_question


@patch("services.chat.OpenAI")
def test_returns_model_answer(mock_openai):
    mock_openai.return_value.chat.completions.create.return_value = MagicMock(
        choices=[MagicMock(message=MagicMock(content='{"answer": "Paris", "found_in_doc": true}'))]
    )

    result = answer_question("What is the capital of France?", ["France's capital is Paris."])

    assert result["answer"] == "Paris"
    assert result["found_in_doc"] is True


@patch("services.chat.OpenAI")
def test_returns_not_found_when_context_missing(mock_openai):
    mock_openai.return_value.chat.completions.create.return_value = MagicMock(
        choices=[MagicMock(message=MagicMock(
            content='{"answer": "I couldn\'t find information about this in the document.", "found_in_doc": false}'
        ))]
    )

    result = answer_question("What is the weather like?", ["Unrelated context."])

    assert result["found_in_doc"] is False


@patch("services.chat.OpenAI")
def test_context_chunks_appear_in_prompt(mock_openai):
    captured = {}

    def capture_call(**kwargs):
        captured["messages"] = kwargs["messages"]
        return MagicMock(choices=[MagicMock(message=MagicMock(content='{"answer": "blue", "found_in_doc": true}'))])

    mock_openai.return_value.chat.completions.create.side_effect = capture_call

    chunks = ["The sky is blue.", "Water is wet."]
    answer_question("What colour is the sky?", chunks)

    user_message = captured["messages"][1]["content"]
    assert "The sky is blue." in user_message
    assert "Water is wet." in user_message
