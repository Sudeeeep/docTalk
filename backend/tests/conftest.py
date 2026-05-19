import fitz
import pytest


def _make_pdf(path, pages: list[str]) -> str:
    doc = fitz.open()
    for text in pages:
        page = doc.new_page()
        page.insert_text((72, 72), text)
    doc.save(path)
    doc.close()
    return str(path)


@pytest.fixture
def single_page_pdf(tmp_path):
    return _make_pdf(tmp_path / "single.pdf", ["Hello DocTalk"])


@pytest.fixture
def multi_page_pdf(tmp_path):
    return _make_pdf(tmp_path / "multi.pdf", ["Page one content", "Page two content"])


@pytest.fixture
def blank_page_pdf(tmp_path):
    return _make_pdf(tmp_path / "blank.pdf", [""])
