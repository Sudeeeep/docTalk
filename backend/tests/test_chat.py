from unittest.mock import MagicMock, patch

from services.chat import answer_question


@patch("services.chat.OpenAI")
def test_returns_model_answer(mock_openai):
    mock_openai.return_value.chat.completions.create.return_value = MagicMock(
        choices=[MagicMock(message=MagicMock(content="Paris"))]
    )

    result = answer_question("What is the capital of France?", ["France's capital is Paris."])

    assert result == "Paris"


@patch("services.chat.OpenAI")
def test_context_chunks_appear_in_prompt(mock_openai):
    captured = {}

    def capture_call(**kwargs):
        captured["messages"] = kwargs["messages"]
        return MagicMock(choices=[MagicMock(message=MagicMock(content="ok"))])

    mock_openai.return_value.chat.completions.create.side_effect = capture_call

    chunks = ["The sky is blue.", "Water is wet."]
    answer_question("What colour is the sky?", chunks)

    user_message = captured["messages"][1]["content"]
    assert "The sky is blue." in user_message
    assert "Water is wet." in user_message
