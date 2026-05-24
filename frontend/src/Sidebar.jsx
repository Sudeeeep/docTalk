import { useRef, useState } from 'react'
import API from './api'

export default function Sidebar({ docs, activeDocId, onSelect, onUploadNew, onRename, onDelete, isOpen }) {
  const [editingDocId, setEditingDocId] = useState(null)
  const [editingName, setEditingName] = useState('')
  const inputRef = useRef(null)

  function startEdit(doc) {
    setEditingDocId(doc.doc_id)
    setEditingName(doc.original_filename)
    setTimeout(() => inputRef.current?.focus(), 0)
  }

  async function saveEdit(doc_id) {
    const name = editingName.trim()
    setEditingDocId(null)
    if (!name) return
    await fetch(`${API}/documents/${doc_id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ original_filename: name }),
    })
    onRename(doc_id, name)
  }

  async function handleDelete(doc_id) {
    if (!window.confirm('Delete this document and its entire chat history?')) return
    await fetch(`${API}/documents/${doc_id}`, { method: 'DELETE' })
    onDelete(doc_id)
  }

  return (
    <aside className={`
      fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200
      flex flex-col h-screen shrink-0
      transition-transform duration-300 ease-in-out
      ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      lg:relative lg:translate-x-0 lg:z-auto
    `}>
      <div className="px-4 py-4 border-b border-gray-200">
        <h1 className="text-lg font-bold text-gray-900">DocTalk</h1>
      </div>

      <div className="p-3">
        <button
          onClick={onUploadNew}
          className="w-full text-sm px-3 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors"
        >
          + Upload new PDF
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 pb-4 space-y-1">
        {docs.length === 0 && (
          <p className="text-xs text-gray-400 px-2 py-2">No documents yet.</p>
        )}
        {docs.map(doc => (
          <div key={doc.doc_id} className="group flex items-center gap-1 rounded-lg">
            {editingDocId === doc.doc_id ? (
              <input
                ref={inputRef}
                value={editingName}
                onChange={e => setEditingName(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') saveEdit(doc.doc_id)
                  if (e.key === 'Escape') setEditingDocId(null)
                }}
                onBlur={() => saveEdit(doc.doc_id)}
                className="flex-1 text-sm px-2 py-1.5 rounded-md border border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-0"
              />
            ) : (
              <>
                <button
                  onClick={() => onSelect(doc.doc_id, doc.original_filename)}
                  className={`flex-1 text-left px-3 py-2 rounded-lg text-sm transition-colors truncate ${
                    doc.doc_id === activeDocId
                      ? 'bg-blue-50 text-blue-700 font-medium'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  title={doc.original_filename}
                >
                  {doc.original_filename}
                </button>

                <div className="hidden group-hover:flex items-center shrink-0 pr-1">
                  <button
                    onClick={() => startEdit(doc)}
                    title="Rename"
                    className="p-1 rounded text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 012.828 0l.172.172a2 2 0 010 2.828L12 16H9v-3z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDelete(doc.doc_id)}
                    title="Delete"
                    className="p-1 rounded text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7h6m-7 0a1 1 0 001-1h4a1 1 0 001 1m-6 0h6" />
                    </svg>
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </nav>
    </aside>
  )
}
