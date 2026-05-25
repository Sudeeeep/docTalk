import os
import shutil
import uuid

from contextlib import asynccontextmanager

from dotenv import load_dotenv
from fastapi import Depends, FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy.orm import Session

from db import Document, Message, get_db, init_db
from services.chat import answer_from_general, answer_question
from services.chunker import chunk_text
from services.embedder import delete_store, embed_and_store
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
    allow_origins=os.getenv("CORS_ORIGINS", "http://localhost:5173").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = "uploads"


class ChatRequest(BaseModel):
    doc_id: str
    question: str
    mode: str = "document"


class RenameRequest(BaseModel):
    original_filename: str


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/upload")
async def upload_pdf(file: UploadFile = File(...), session_id: str = Form(None), db: Session = Depends(get_db)):
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

    db.add(Document(
        doc_id=doc_id,
        filename=unique_name,
        original_filename=file.filename,
        session_id=session_id,
        summary=summary,
    ))
    db.commit()

    return {"filename": unique_name, "characters": len(text), "chunks": stored}


@app.post("/chat")
def chat(body: ChatRequest, db: Session = Depends(get_db)):
    doc_id = body.doc_id.replace(".pdf", "")

    if body.mode == "general":
        result = answer_from_general(body.question)
    else:
        try:
            chunks = retrieve(body.question, doc_id)
        except Exception:
            raise HTTPException(status_code=404, detail="Document not found. Please upload it first.")

        doc = db.query(Document).filter(Document.doc_id == doc_id).first()
        context = ([doc.summary] + chunks) if doc else chunks
        result = answer_question(body.question, context)

    db.add(Message(doc_id=doc_id, question=body.question, answer=result["answer"]))
    db.commit()

    return {"answer": result["answer"], "found_in_doc": result["found_in_doc"]}


@app.get("/documents")
def get_documents(session_id: str = None, db: Session = Depends(get_db)):
    if not session_id:
        return []
    docs = (
        db.query(Document)
        .filter(Document.session_id == session_id)
        .order_by(Document.created_at.desc())
        .all()
    )
    return [
        {
            "doc_id": d.doc_id,
            "original_filename": d.original_filename,
            "summary": d.summary,
            "created_at": d.created_at,
        }
        for d in docs
    ]


@app.patch("/documents/{doc_id}")
def rename_document(doc_id: str, body: RenameRequest, db: Session = Depends(get_db)):
    doc = db.query(Document).filter(Document.doc_id == doc_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found.")
    doc.original_filename = body.original_filename
    db.commit()
    return {"ok": True}


@app.delete("/documents/{doc_id}")
def delete_document(doc_id: str, db: Session = Depends(get_db)):
    doc = db.query(Document).filter(Document.doc_id == doc_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found.")

    db.query(Message).filter(Message.doc_id == doc_id).delete()
    db.delete(doc)
    db.commit()

    delete_store(doc_id)

    file_path = os.path.join(UPLOAD_DIR, doc.filename)
    if os.path.exists(file_path):
        os.remove(file_path)

    return {"ok": True}


@app.get("/history/{doc_id}")
def history(doc_id: str, db: Session = Depends(get_db)):
    messages = (
        db.query(Message)
        .filter(Message.doc_id == doc_id)
        .order_by(Message.created_at.asc())
        .all()
    )
    return [{"question": m.question, "answer": m.answer, "created_at": m.created_at} for m in messages]
