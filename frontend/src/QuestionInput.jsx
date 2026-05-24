import { useState } from 'react'

export default function QuestionInput({ onSubmit, disabled }) {
  const [question, setQuestion] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    const trimmed = question.trim()
    if (!trimmed || disabled) return
    onSubmit(trimmed)
    setQuestion('')
  }

  return (
    <form onSubmit={handleSubmit} className="border-t border-gray-200 bg-white px-6 py-4 flex gap-3">
      <input
        type="text"
        value={question}
        onChange={e => setQuestion(e.target.value)}
        placeholder="Ask a question about your document..."
        disabled={disabled}
        className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
      />
      <button
        type="submit"
        disabled={!question.trim() || disabled}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        Send
      </button>
    </form>
  )
}