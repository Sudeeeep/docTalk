import { useEffect, useState } from 'react'
import API from './api'
import { getSessionId } from './session'

export default function Sidebar({ activeDocId, onSelect, onUploadNew }) {
  const [docs, setDocs] = useState([])

  useEffect(() => {
    async function loadDocs() {
      const res = await fetch(`${API}/documents?session_id=${getSessionId()}`)
      const data = await res.json()
      setDocs(data)
    }
    loadDocs()
  }, [activeDocId])

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col h-screen shrink-0">
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
          <button
            key={doc.doc_id}
            onClick={() => onSelect(doc.doc_id)}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors truncate ${
              doc.doc_id === activeDocId
                ? 'bg-blue-50 text-blue-700 font-medium'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
            title={doc.original_filename}
          >
            {doc.original_filename}
          </button>
        ))}
      </nav>
    </aside>
  )
}
