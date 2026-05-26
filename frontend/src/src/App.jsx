import { useState } from 'react'

const styles = {
  app: {
    display: 'flex',
    height: '100vh',
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
    background: '#f5f5f5',
    color: '#1a1a1a',
  },
  panel: {
    display: 'flex',
    flexDirection: 'column',
    padding: '24px',
    background: '#fff',
    boxSizing: 'border-box',
  },
  leftPanel: {
    width: '40%',
    borderRight: '1px solid #e0e0e0',
  },
  rightPanel: {
    flex: 1,
  },
  panelTitle: {
    fontSize: '18px',
    fontWeight: 600,
    marginBottom: '16px',
    color: '#111',
  },
  textarea: {
    flex: 1,
    resize: 'none',
    border: '1px solid #ddd',
    borderRadius: '8px',
    padding: '12px',
    fontSize: '14px',
    lineHeight: '1.6',
    outline: 'none',
    color: '#333',
    background: '#fafafa',
    marginBottom: '12px',
    fontFamily: 'inherit',
  },
  button: {
    padding: '10px 20px',
    borderRadius: '8px',
    border: 'none',
    background: '#2563eb',
    color: '#fff',
    fontSize: '14px',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'background 0.15s',
  },
  buttonDisabled: {
    background: '#93b4f5',
    cursor: 'not-allowed',
  },
  error: {
    marginTop: '10px',
    padding: '10px 12px',
    borderRadius: '6px',
    background: '#fef2f2',
    color: '#b91c1c',
    fontSize: '13px',
    border: '1px solid #fecaca',
  },
  success: {
    marginTop: '10px',
    padding: '10px 12px',
    borderRadius: '6px',
    background: '#f0fdf4',
    color: '#15803d',
    fontSize: '13px',
    border: '1px solid #bbf7d0',
  },
  chatMessages: {
    flex: 1,
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    paddingRight: '4px',
    marginBottom: '16px',
  },
  messageBlock: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  questionBubble: {
    alignSelf: 'flex-end',
    background: '#2563eb',
    color: '#fff',
    padding: '10px 14px',
    borderRadius: '12px 12px 2px 12px',
    fontSize: '14px',
    maxWidth: '80%',
    lineHeight: '1.5',
  },
  answerBubble: {
    alignSelf: 'flex-start',
    background: '#f1f5f9',
    color: '#1a1a1a',
    padding: '10px 14px',
    borderRadius: '12px 12px 12px 2px',
    fontSize: '14px',
    maxWidth: '90%',
    lineHeight: '1.6',
  },
  sourcesToggle: {
    alignSelf: 'flex-start',
    background: 'none',
    border: '1px solid #cbd5e1',
    color: '#475569',
    fontSize: '12px',
    padding: '4px 10px',
    borderRadius: '20px',
    cursor: 'pointer',
    marginTop: '2px',
  },
  sourcesBox: {
    background: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    padding: '12px',
    fontSize: '13px',
    color: '#475569',
    maxWidth: '90%',
  },
  sourceChunk: {
    padding: '8px 0',
    borderBottom: '1px solid #e2e8f0',
    lineHeight: '1.5',
  },
  sourceChunkLast: {
    padding: '8px 0 0',
    lineHeight: '1.5',
  },
  chatInputRow: {
    display: 'flex',
    gap: '8px',
  },
  chatInput: {
    flex: 1,
    padding: '10px 14px',
    borderRadius: '8px',
    border: '1px solid #ddd',
    fontSize: '14px',
    outline: 'none',
    fontFamily: 'inherit',
  },
  spinner: {
    display: 'inline-block',
    width: '16px',
    height: '16px',
    border: '2px solid #fff',
    borderTopColor: 'transparent',
    borderRadius: '50%',
    animation: 'spin 0.7s linear infinite',
    verticalAlign: 'middle',
    marginRight: '6px',
  },
}

function Spinner() {
  return (
    <>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <span style={styles.spinner} />
    </>
  )
}

function SourceChunks({ chunks }) {
  if (!chunks || chunks.length === 0) return null
  return (
    <div style={styles.sourcesBox}>
      <div style={{ fontWeight: 600, marginBottom: '8px', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        Sources
      </div>
      {chunks.map((chunk, i) => (
        <div key={i} style={i === chunks.length - 1 ? styles.sourceChunkLast : styles.sourceChunk}>
          {chunk}
        </div>
      ))}
    </div>
  )
}

function MessageBlock({ question, answer, sources }) {
  const [showSources, setShowSources] = useState(false)

  return (
    <div style={styles.messageBlock}>
      <div style={styles.questionBubble}>{question}</div>
      <div style={styles.answerBubble}>{answer}</div>
      {sources && sources.length > 0 && (
        <>
          <button
            style={styles.sourcesToggle}
            onClick={() => setShowSources(v => !v)}
          >
            {showSources ? '▲ Hide sources' : `▼ Show ${sources.length} source${sources.length !== 1 ? 's' : ''}`}
          </button>
          {showSources && <SourceChunks chunks={sources} />}
        </>
      )}
    </div>
  )
}

export default function App() {
  const [notes, setNotes] = useState('')
  const [uploadLoading, setUploadLoading] = useState(false)
  const [uploadError, setUploadError] = useState(null)
  const [uploadSuccess, setUploadSuccess] = useState(null)

  const [question, setQuestion] = useState('')
  const [messages, setMessages] = useState([])
  const [askLoading, setAskLoading] = useState(false)
  const [askError, setAskError] = useState(null)

  async function handleUpload() {
    setUploadError(null)
    setUploadSuccess(null)
    setUploadLoading(true)
    try {
      const res = await fetch('https://study-assistant-k5qb.onrender.com/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes }),
      })
      if (!res.ok) throw new Error(`Server responded with ${res.status}`)
      setUploadSuccess('Notes uploaded successfully.')
    } catch (e) {
      setUploadError(e.message || 'Failed to upload notes.')
    } finally {
      setUploadLoading(false)
    }
  }

  async function handleAsk() {
    if (!question.trim()) return
    setAskError(null)
    setAskLoading(true)
    const q = question.trim()
    setQuestion('')
    try {
      const res = await fetch('https://study-assistant-k5qb.onrender.com/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: q }),
      })
      if (!res.ok) throw new Error(`Server responded with ${res.status}`)
      const data = await res.json()
      setMessages(prev => [
        ...prev,
        { question: q, answer: data.answer, sources: data.sources ?? [] },
      ])
    } catch (e) {
      setAskError(e.message || 'Failed to get an answer.')
    } finally {
      setAskLoading(false)
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleAsk()
    }
  }

  return (
    <div style={styles.app}>
      {/* Left: Notes panel */}
      <div style={{ ...styles.panel, ...styles.leftPanel }}>
        <div style={styles.panelTitle}>Notes</div>
        <textarea
          style={styles.textarea}
          placeholder="Paste your study notes here..."
          value={notes}
          onChange={e => setNotes(e.target.value)}
        />
        <button
          style={{
            ...styles.button,
            ...(uploadLoading ? styles.buttonDisabled : {}),
          }}
          onClick={handleUpload}
          disabled={uploadLoading}
        >
          {uploadLoading && <Spinner />}
          {uploadLoading ? 'Uploading...' : 'Upload Notes'}
        </button>
        {uploadError && <div style={styles.error}>{uploadError}</div>}
        {uploadSuccess && <div style={styles.success}>{uploadSuccess}</div>}
      </div>

      {/* Right: Chat panel */}
      <div style={{ ...styles.panel, ...styles.rightPanel }}>
        <div style={styles.panelTitle}>Ask a Question</div>
        <div style={styles.chatMessages}>
          {messages.length === 0 && (
            <div style={{ color: '#94a3b8', fontSize: '14px', marginTop: '8px' }}>
              Upload your notes, then ask anything about them.
            </div>
          )}
          {messages.map((msg, i) => (
            <MessageBlock key={i} {...msg} />
          ))}
          {askLoading && (
            <div style={{ color: '#64748b', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
              <span style={{ ...styles.spinner, border: '2px solid #2563eb', borderTopColor: 'transparent' }} />
              Thinking...
            </div>
          )}
        </div>
        {askError && <div style={{ ...styles.error, marginBottom: '12px' }}>{askError}</div>}
        <div style={styles.chatInputRow}>
          <input
            style={styles.chatInput}
            type="text"
            placeholder="Ask something about your notes..."
            value={question}
            onChange={e => setQuestion(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={askLoading}
          />
          <button
            style={{
              ...styles.button,
              ...(askLoading || !question.trim() ? styles.buttonDisabled : {}),
            }}
            onClick={handleAsk}
            disabled={askLoading || !question.trim()}
          >
            {askLoading ? <Spinner /> : null}
            Ask
          </button>
        </div>
      </div>
    </div>
  )
}
