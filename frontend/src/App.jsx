import { useState } from 'react'
import UploadScreen from './UploadScreen'
import ChatScreen from './ChatScreen'

export default function App() {
  const [docId, setDocId] = useState(null)

  return (
    <div className="min-h-screen bg-gray-50">
      {docId
        ? <ChatScreen docId={docId} onReset={() => setDocId(null)} />
        : <UploadScreen onUpload={setDocId} />
      }
    </div>
  )
}