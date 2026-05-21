import fitz
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from db import Base, get_db
from main import app


@pytest.fixture(autouse=True)
def override_db():
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(engine)
    TestingSession = sessionmaker(bind=engine)

    def _get_test_db():
        db = TestingSession()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = _get_test_db
    yield
    app.dependency_overrides.clear()
    engine.dispose()


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
