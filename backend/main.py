import os
import shutil
import uuid

from contextlib import asynccontextmanager

from dotenv import load_dotenv
from fastapi import Depends, FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy.orm import Session

from db import Document, Message, get_db, init_db
from services.chat import answer_question
from services.chunker import chunk_text
from services.embedder import embed_and_store
from services.pdf import extract_text
from services.retriever import retrieve
from services.summariser import summarise

load_dotenv()


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield


app = FastAPI(title="DocTalk API", version="0.1.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = "uploads"


class ChatRequest(BaseModel):
    doc_id: str
    question: str


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/upload")
async def upload_pdf(file: UploadFile = File(...), db: Session = Depends(get_db)):
    if file.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="Only PDF files are accepted.")

    ext = os.path.splitext(file.filename)[1]
    unique_name = f"{uuid.uuid4().hex}{ext}"
    doc_id = unique_name.replace(".pdf", "")
    dest = os.path.join(UPLOAD_DIR, unique_name)

    with open(dest, "wb") as f:
        shutil.copyfileobj(file.file, f)

    text = extract_text(dest)
    chunks = chunk_text(text)
    stored = embed_and_store(chunks, doc_id)
    summary = summarise(text)

    db.add(Document(doc_id=doc_id, filename=unique_name, summary=summary))
    db.commit()

    return {"filename": unique_name, "characters": len(text), "chunks": stored}


@app.post("/chat")
def chat(body: ChatRequest, db: Session = Depends(get_db)):
    doc_id = body.doc_id.replace(".pdf", "")
    try:
        chunks = retrieve(body.question, doc_id)
    except Exception:
        raise HTTPException(status_code=404, detail="Document not found. Please upload it first.")

    doc = db.query(Document).filter(Document.doc_id == doc_id).first()
    context = ([doc.summary] + chunks) if doc else chunks

    answer = answer_question(body.question, context)

    db.add(Message(doc_id=doc_id, question=body.question, answer=answer))
    db.commit()

    return {"answer": answer}


@app.get("/history/{doc_id}")
def history(doc_id: str, db: Session = Depends(get_db)):
    messages = (
        db.query(Message)
        .filter(Message.doc_id == doc_id)
        .order_by(Message.created_at.asc())
        .all()
    )
    return [{"question": m.question, "answer": m.answer, "created_at": m.created_at} for m in messages]
