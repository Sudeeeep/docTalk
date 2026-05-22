import { useEffect, useState } from 'react'
import MessageList from './MessageList'
import QuestionInput from './QuestionInput'
import API from './api'

export default function ChatScreen({ docId }) {
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
    <div className="flex flex-col h-screen max-w-3xl mx-auto">
      <header className="flex items-center px-4 py-3 border-b border-gray-200 bg-white">
        <h2 className="text-sm font-medium text-gray-500 truncate">Chat</h2>
      </header>

      <MessageList messages={messages} loading={loading} />

      <QuestionInput onSubmit={handleQuestion} disabled={loading} />
    </div>
  )
}