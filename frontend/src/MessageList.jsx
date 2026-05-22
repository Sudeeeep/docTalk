import { useEffect, useRef } from 'react'

export default function MessageList({ messages, loading }) {
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  if (messages.length === 0 && !loading) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-400">
        Ask a question about your document
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
      {messages.map((msg, i) => (
        <div key={i} className="space-y-2">
          <div className="flex justify-end">
            <p className="bg-blue-600 text-white px-4 py-2 rounded-2xl rounded-tr-sm max-w-[75%] text-sm">
              {msg.question}
            </p>
          </div>
          <div className="flex justify-start">
            <p className="bg-white text-gray-800 px-4 py-2 rounded-2xl rounded-tl-sm max-w-[75%] text-sm shadow-sm">
              {msg.answer}
            </p>
          </div>
        </div>
      ))}

      {loading && (
        <div className="flex justify-start">
          <p className="bg-white text-gray-400 px-4 py-2 rounded-2xl rounded-tl-sm text-sm shadow-sm">
            Thinking...
          </p>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  )
}
