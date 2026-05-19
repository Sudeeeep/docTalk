from services.pdf import extract_text


def test_extracts_text_from_single_page(single_page_pdf):
    result = extract_text(single_page_pdf)
    assert "Hello DocTalk" in result


def test_extracts_text_from_all_pages(multi_page_pdf):
    result = extract_text(multi_page_pdf)
    assert "Page one content" in result
    assert "Page two content" in result


def test_blank_page_returns_empty_string(blank_page_pdf):
    result = extract_text(blank_page_pdf)
    assert result == ""
