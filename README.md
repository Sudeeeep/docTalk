# DocTalk

A RAG (Retrieval-Augmented Generation) application that lets users upload PDF documents and ask natural language questions about them.

## Stack

- **Backend:** Python, FastAPI, LangChain, ChromaDB, OpenAI API
- **Frontend:** React, Tailwind CSS
- **Database:** PostgreSQL (persistent chat history)
- **Infrastructure:** Docker, deployed on Render

## Project Structure

```
DocTalk/
├── backend/        # FastAPI application, LangChain pipeline, ChromaDB
├── frontend/       # React + Tailwind CSS
├── docker/         # Dockerfiles and docker-compose
└── README.md
```

## Features

- Upload PDF documents
- Ask natural language questions about uploaded documents
- Persistent chat history per document
- Streamed responses via OpenAI

## Getting Started

_Setup instructions will be added as the project is built out._
