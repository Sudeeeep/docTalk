import { useEffect, useState } from 'react'
import Sidebar from './Sidebar'
import UploadScreen from './UploadScreen'
import ChatScreen from './ChatScreen'
import API from './api'
import { getSessionId } from './session'

export default function App() {
  const [docId, setDocId] = useState(null)
  const [showUpload, setShowUpload] = useState(false)
  const [validated, setValidated] = useState(false)

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
        if (docs.some(d => d.doc_id === stored)) {
          setDocId(stored)
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

  function handleUpload(id) {
    localStorage.setItem('docId', id)
    setDocId(id)
    setShowUpload(false)
  }

  function handleSelect(id) {
    localStorage.setItem('docId', id)
    setDocId(id)
    setShowUpload(false)
  }

  function handleUploadNew() {
    setShowUpload(true)
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
      <Sidebar
        activeDocId={docId}
        onSelect={handleSelect}
        onUploadNew={handleUploadNew}
      />
      <main className="flex-1 min-w-0">
        <ChatScreen docId={docId} />
      </main>
    </div>
  )
}
