import { useState } from 'react'
import UploadScreen from './UploadScreen'
import ChatScreen from './ChatScreen'

export default function App() {
  const [docId, setDocId] = useState(localStorage.getItem('docId'))

  function handleUpload(id) {
    localStorage.setItem('docId', id)
    setDocId(id)
  }

  function handleReset() {
    localStorage.removeItem('docId')
    setDocId(null)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {docId
        ? <ChatScreen docId={docId} onReset={handleReset} />
        : <UploadScreen onUpload={handleUpload} />
      }
    </div>
  )
}