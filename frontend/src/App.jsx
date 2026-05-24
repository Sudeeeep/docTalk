import { useEffect, useState } from 'react'
import Sidebar from './Sidebar'
import UploadScreen from './UploadScreen'
import ChatScreen from './ChatScreen'
import API from './api'
import { getSessionId } from './session'

export default function App() {
  const [docs, setDocs] = useState([])
  const [docId, setDocId] = useState(null)
  const [docName, setDocName] = useState('')
  const [showUpload, setShowUpload] = useState(false)
  const [validated, setValidated] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  async function loadDocs() {
    const res = await fetch(`${API}/documents?session_id=${getSessionId()}`)
    const data = await res.json()
    setDocs(data)
    return data
  }

  useEffect(() => {
    async function validateStoredDoc() {
      const stored = localStorage.getItem('docId')
      const fetched = await loadDocs()
      if (stored) {
        const match = fetched.find(d => d.doc_id === stored)
        if (match) {
          setDocId(stored)
          setDocName(match.original_filename)
        } else {
          localStorage.removeItem('docId')
        }
      }
      setValidated(true)
    }
    validateStoredDoc()
  }, [])

  function handleUpload(id, name) {
    localStorage.setItem('docId', id)
    setDocId(id)
    setDocName(name)
    setShowUpload(false)
    loadDocs()
  }

  function handleSelect(id, name) {
    localStorage.setItem('docId', id)
    setDocId(id)
    setDocName(name)
    setShowUpload(false)
    setSidebarOpen(false)
  }

  function handleRename(id, name) {
    setDocs(prev => prev.map(d => d.doc_id === id ? { ...d, original_filename: name } : d))
    if (id === docId) setDocName(name)
  }

  function handleDelete(id) {
    setDocs(prev => prev.filter(d => d.doc_id !== id))
    if (id === docId) {
      localStorage.removeItem('docId')
      setDocId(null)
      setDocName('')
    }
  }

  function handleUploadNew() {
    setShowUpload(true)
    setSidebarOpen(false)
  }

  if (!validated) return null

  if (!docId || showUpload) {
    return (
      <div className="min-h-screen bg-gray-50">
        <UploadScreen onUpload={handleUpload} />
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <Sidebar
        docs={docs}
        activeDocId={docId}
        onSelect={handleSelect}
        onUploadNew={handleUploadNew}
        onRename={handleRename}
        onDelete={handleDelete}
        isOpen={sidebarOpen}
      />

      <main className="flex-1 min-w-0">
        <ChatScreen
          key={docId}
          docId={docId}
          docName={docName}
          onToggleSidebar={() => setSidebarOpen(o => !o)}
          onRename={(name) => handleRename(docId, name)}
        />
      </main>
    </div>
  )
}
