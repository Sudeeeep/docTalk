import { useEffect, useRef } from 'react'

export default function MessageList({ messages, onGeneralKnowledge }) {
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  if (messages.length === 0) {
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

          {msg.answer != null && (
            <div className="flex justify-start">
              <p className="bg-white text-gray-800 px-4 py-2 rounded-2xl rounded-tl-sm max-w-[75%] text-sm shadow-sm">
                {msg.answer}
              </p>
            </div>
          )}

          {msg.answer == null && msg.found_in_doc === null && (
            <div className="flex justify-start">
              <p className="bg-white text-gray-400 px-4 py-2 rounded-2xl rounded-tl-sm text-sm shadow-sm">
                Thinking...
              </p>
            </div>
          )}

          {msg.found_in_doc === false && msg.answer != null && (
            <div className="flex justify-start ml-1">
              <button
                onClick={() => onGeneralKnowledge(msg.question, i)}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100 transition-colors cursor-pointer"
              >
                <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                </svg>
                                Not found in document — answer from general knowledge?
              </button>
            </div>
          )}
        </div>
      ))}

      <div ref={bottomRef} />
    </div>
  )
}
