import os
import shutil
import uuid

from dotenv import load_dotenv
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware

from services.chunker import chunk_text
from services.embedder import embed_and_store
from services.pdf import extract_text

load_dotenv()

app = FastAPI(title="DocTalk API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = "uploads"


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/upload")
async def upload_pdf(file: UploadFile = File(...)):
    if file.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="Only PDF files are accepted.")

    ext = os.path.splitext(file.filename)[1]
    unique_name = f"{uuid.uuid4().hex}{ext}"
    dest = os.path.join(UPLOAD_DIR, unique_name)

    with open(dest, "wb") as f:
        shutil.copyfileobj(file.file, f)

    text = extract_text(dest)
    chunks = chunk_text(text)
    stored = embed_and_store(chunks, unique_name.replace(".pdf", ""))

    return {"filename": unique_name, "characters": len(text), "chunks": stored}
