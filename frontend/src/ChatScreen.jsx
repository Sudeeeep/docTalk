import { useEffect, useRef, useState } from 'react'
import MessageList from './MessageList'
import QuestionInput from './QuestionInput'
import API from './api'

export default function ChatScreen({ docId, docName, onToggleSidebar, onRename }) {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const [editingName, setEditingName] = useState(false)
  const [nameInput, setNameInput] = useState('')
  const nameInputRef = useRef(null)

  useEffect(() => {
    const controller = new AbortController()
    async function loadHistory() {
      try {
        const res = await fetch(`${API}/history/${docId}`, { signal: controller.signal })
        const data = await res.json()
        setMessages(data)
      } catch (e) {
        if (e.name !== 'AbortError') console.error(e)
      }
    }
    loadHistory()
    return () => controller.abort()
  }, [docId])

  function startEditName() {
    setNameInput(docName)
    setEditingName(true)
    setTimeout(() => nameInputRef.current?.focus(), 0)
  }

  async function saveEditName() {
    const name = nameInput.trim()
    setEditingName(false)
    if (!name || name === docName) return
    await fetch(`${API}/documents/${docId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ original_filename: name }),
    })
    onRename(name)
  }

  async function handleQuestion(question) {
    setMessages(prev => [...prev, { question, answer: null, found_in_doc: null }])
    setLoading(true)
    try {
      const res = await fetch(`${API}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ doc_id: docId, question }),
      })
      const data = await res.json()
      setMessages(prev => {
        const updated = [...prev]
        updated[updated.length - 1] = { question, answer: data.answer, found_in_doc: data.found_in_doc }
        return updated
      })
    } finally {
      setLoading(false)
    }
  }

  async function handleGeneralKnowledge(question, index) {
    setMessages(prev => prev.map((m, i) => i === index ? { ...m, answer: null, found_in_doc: null } : m))
    const res = await fetch(`${API}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ doc_id: docId, question, mode: 'general' }),
    })
    const data = await res.json()
    setMessages(prev => prev.map((m, i) => i === index ? { ...m, answer: data.answer, found_in_doc: true } : m))
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

        <div className="flex items-center gap-2 flex-1 min-w-0">
          {editingName ? (
            <input
              ref={nameInputRef}
              value={nameInput}
              onChange={e => setNameInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') saveEditName()
                if (e.key === 'Escape') setEditingName(false)
              }}
              onBlur={saveEditName}
              className="flex-1 text-sm font-semibold border-b border-blue-400 focus:outline-none bg-transparent min-w-0"
            />
          ) : (
            <>
              <h2 className="text-sm font-semibold text-gray-800 truncate">
                {docName || 'Document'}
              </h2>
              <button
                onClick={startEditName}
                title="Rename document"
                className="p-1 rounded text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors shrink-0"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 012.828 0l.172.172a2 2 0 010 2.828L12 16H9v-3z" />
                </svg>
              </button>
            </>
          )}
        </div>
      </header>

      <MessageList messages={messages} onGeneralKnowledge={handleGeneralKnowledge} />
      <QuestionInput onSubmit={handleQuestion} disabled={loading} />
    </div>
  )
}
