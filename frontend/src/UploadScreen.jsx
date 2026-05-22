import { useRef, useState } from 'react'
import API from './api'

export default function UploadScreen({ onUpload }) {
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const inputRef = useRef(null)

  async function handleUpload() {
    if (!file) return
    setLoading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch(`${API}/upload`, { method: 'POST', body: formData })
      const data = await res.json()

      if (!res.ok) throw new Error(data.detail || 'Upload failed')

      onUpload(data.filename.replace('.pdf', ''))
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-6 px-4">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900">DocTalk</h1>
        <p className="mt-2 text-gray-500">Upload a PDF and ask questions about it</p>
      </div>

      <div
        onClick={() => inputRef.current.click()}
        className="w-full max-w-md border-2 border-dashed border-gray-300 rounded-xl p-10 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors"
      >
        <p className="text-gray-500">
          {file ? file.name : 'Click to select a PDF'}
        </p>
        <input
          ref={inputRef}
          type="file"
          accept=".pdf"
          className="hidden"
          onChange={e => setFile(e.target.files[0])}
        />
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <button
        onClick={handleUpload}
        disabled={!file || loading}
        className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? 'Uploading...' : 'Upload & Start Chat'}
      </button>
    </div>
  )
}
