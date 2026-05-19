from services.chunker import chunk_text


def test_short_text_is_single_chunk():
    result = chunk_text("This is a short sentence.")
    assert len(result) == 1
    assert result[0] == "This is a short sentence."


def test_long_text_produces_multiple_chunks():
    # ~600 chars — just over one chunk_size of 500
    text = ("word " * 120).strip()
    result = chunk_text(text)
    assert len(result) > 1


def test_chunks_overlap():
    # Build text large enough to force at least two chunks
    text = ("overlap " * 150).strip()
    chunks = chunk_text(text)
    assert len(chunks) >= 2
    # The tail of chunk 0 should appear at the start of chunk 1
    tail = chunks[0][-50:]
    assert tail in chunks[1]


def test_empty_text_returns_empty_list():
    result = chunk_text("")
    assert result == []
