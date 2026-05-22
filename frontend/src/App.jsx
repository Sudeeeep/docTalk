import { useState } from 'react'
import Sidebar from './Sidebar'
import UploadScreen from './UploadScreen'
import ChatScreen from './ChatScreen'

export default function App() {
  const [docId, setDocId] = useState(localStorage.getItem('docId'))
  const [showUpload, setShowUpload] = useState(false)

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

  if (!docId && !showUpload) {
    return (
      <div className="min-h-screen bg-gray-50">
        <UploadScreen onUpload={handleUpload} />
      </div>
    )
  }

  if (showUpload) {
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
        <ChatScreen docId={docId} onReset={handleUploadNew} />
      </main>
    </div>
  )
}
