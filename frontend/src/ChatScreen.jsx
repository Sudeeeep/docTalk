import { useEffect, useState } from 'react'
import MessageList from './MessageList'
import QuestionInput from './QuestionInput'
import API from './api'

export default function ChatScreen({ docId, docName, onToggleSidebar }) {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    async function loadHistory() {
      const res = await fetch(`${API}/history/${docId}`)
      const data = await res.json()
      setMessages(data)
    }
    loadHistory()
  }, [docId])

  async function handleQuestion(question) {
    setLoading(true)
    try {
      const res = await fetch(`${API}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ doc_id: docId, question }),
      })
      const data = await res.json()
      setMessages(prev => [...prev, { question, answer: data.answer }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-screen w-full">
      <header className="flex items-center gap-3 px-6 py-4 border-b border-gray-200 bg-white shrink-0">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-1 rounded-md text-gray-500 hover:bg-gray-100 transition-colors shrink-0"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <h2 className="text-sm font-semibold text-gray-800 truncate">
          {docName || 'Document'}
        </h2>
      </header>

      <MessageList messages={messages} loading={loading} />

      <QuestionInput onSubmit={handleQuestion} disabled={loading} />
    </div>
  )
}
