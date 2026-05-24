import { useEffect, useState } from 'react'
import Sidebar from './Sidebar'
import UploadScreen from './UploadScreen'
import ChatScreen from './ChatScreen'
import API from './api'
import { getSessionId } from './session'

export default function App() {
  const [docId, setDocId] = useState(null)
  const [docName, setDocName] = useState('')
  const [showUpload, setShowUpload] = useState(false)
  const [validated, setValidated] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    async function validateStoredDoc() {
      const stored = localStorage.getItem('docId')
      if (!stored) {
        setValidated(true)
        return
      }
      try {
        const res = await fetch(`${API}/documents?session_id=${getSessionId()}`)
        const docs = await res.json()
        const match = docs.find(d => d.doc_id === stored)
        if (match) {
          setDocId(stored)
          setDocName(match.original_filename)
        } else {
          localStorage.removeItem('docId')
        }
      } catch {
        localStorage.removeItem('docId')
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
  }

  function handleSelect(id, name) {
    localStorage.setItem('docId', id)
    setDocId(id)
    setDocName(name)
    setShowUpload(false)
    setSidebarOpen(false)
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
        activeDocId={docId}
        onSelect={handleSelect}
        onUploadNew={handleUploadNew}
        isOpen={sidebarOpen}
      />

      <main className="flex-1 min-w-0">
        <ChatScreen
          docId={docId}
          docName={docName}
          onToggleSidebar={() => setSidebarOpen(o => !o)}
        />
      </main>
    </div>
  )
}
