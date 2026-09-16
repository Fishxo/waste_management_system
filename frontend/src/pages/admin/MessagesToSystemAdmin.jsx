import { useState, useEffect } from 'react'
import api from '../../api/axios'

export default function MessagesToSystemAdmin() {
  const [threads, setThreads] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCompose, setShowCompose] = useState(false)
  const [form, setForm] = useState({ subject: '', message: '' })
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState('')

  const [selectedThread, setSelectedThread] = useState(null)
  const [threadMessages, setThreadMessages] = useState([])
  const [threadLoading, setThreadLoading] = useState(false)
  const [replyText, setReplyText] = useState('')
  const [replying, setReplying] = useState(false)

  const fetchThreads = async () => {
    try {
      const { data } = await api.get('/muAdmin/messages')
      setThreads(data.data || [])
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchThreads()
  }, [])

  const handleCompose = async (e) => {
    e.preventDefault()
    setFormError('')
    setSubmitting(true)
    try {
      const { data } = await api.post('/muAdmin/messages', form)
      setForm({ subject: '', message: '' })
      setShowCompose(false)
      setThreads((prev) => [{ ...data.data, reply_count: 0, unread_replies: 0, last_reply_at: null }, ...prev])
      openThread(data.data.id)
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to send')
    } finally {
      setSubmitting(false)
    }
  }

  const openThread = async (threadId) => {
    setSelectedThread(threadId)
    setThreadLoading(true)
    setThreadMessages([])
    setReplyText('')
    try {
      const { data } = await api.get(`/muAdmin/messages/${threadId}`)
      setThreadMessages(data.data.messages || [])
      setThreads((prev) =>
        prev.map((t) =>
          t.id === threadId ? { ...t, unread_replies: 0 } : t
        )
      )
    } catch {
      // ignore
    } finally {
      setThreadLoading(false)
    }
  }

  const handleReply = async (e) => {
    e.preventDefault()
    if (!replyText.trim()) return
    setReplying(true)
    try {
      const { data } = await api.post(`/muAdmin/messages/${selectedThread}/reply`, {
        message: replyText.trim(),
      })
      setThreadMessages((prev) => [...prev, data.data])
      setReplyText('')
    } catch {
      // ignore
    } finally {
      setReplying(false)
    }
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (selectedThread) {
    const currentThread = threads.find((t) => t.id === selectedThread)

    return (
      <div className="space-y-4">
        <button
          onClick={() => {
            setSelectedThread(null)
            setThreadMessages([])
            fetchThreads()
          }}
          className="text-indigo-600 hover:text-indigo-800 text-sm font-medium flex items-center gap-1"
        >
          ← Back to messages
        </button>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="border-b pb-3 mb-4">
            <h2 className="text-xl font-bold text-gray-900">{currentThread?.subject}</h2>
            <p className="text-xs text-gray-500 mt-1">
              Started {formatDate(currentThread?.created_at)}
            </p>
          </div>

          {threadLoading ? (
            <p className="text-gray-500 text-sm">Loading messages...</p>
          ) : (
            <div className="space-y-3 max-h-[400px] overflow-y-auto mb-4">
              {threadMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`p-3 rounded-lg text-sm ${
                    msg.sender_role === 'municipal_admin'
                      ? 'bg-indigo-50 border-l-4 border-indigo-400 ml-8'
                      : 'bg-gray-50 border-l-4 border-gray-400 mr-8'
                  }`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-medium text-gray-800">
                      {msg.sender_role === 'municipal_admin'
                        ? 'You'
                        : 'System Admin'}
                    </span>
                    <span className="text-xs text-gray-500">
                      {formatDate(msg.created_at)}
                    </span>
                  </div>
                  <p className="text-gray-700 whitespace-pre-wrap">{msg.message}</p>
                </div>
              ))}
            </div>
          )}

          <form onSubmit={handleReply} className="flex gap-2">
            <input
              type="text"
              placeholder="Type a reply..."
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              disabled={replying}
            />
            <button
              type="submit"
              disabled={replying || !replyText.trim()}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded text-sm font-medium disabled:opacity-50 cursor-pointer"
            >
              {replying ? 'Sending...' : 'Reply'}
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">
          Message System Admin
        </h1>
        <button
          onClick={() => {
            setShowCompose(true)
            setFormError('')
          }}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded text-sm font-medium cursor-pointer"
        >
          + New Message
        </button>
      </div>

      {showCompose && (
        <div className="bg-white rounded-lg shadow p-6 space-y-3">
          <h3 className="font-semibold text-gray-800">New Message</h3>
          {formError && (
            <p className="text-red-600 text-sm">{formError}</p>
          )}
          <form onSubmit={handleCompose} className="space-y-3">
            <input
              type="text"
              name="subject"
              placeholder="Subject"
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              required
            />
            <textarea
              name="message"
              placeholder="Your message..."
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              rows={4}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
              required
            />
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={submitting}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded text-sm font-medium disabled:opacity-50 cursor-pointer"
              >
                {submitting ? 'Sending...' : 'Send'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowCompose(false)
                  setFormError('')
                }}
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded text-sm font-medium cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <p className="p-4 text-gray-500 text-sm">Loading...</p>
        ) : threads.length === 0 ? (
          <p className="p-4 text-gray-500 text-sm">
            No messages yet. Click "New Message" to send a comment to the system admin.
          </p>
        ) : (
          <div className="divide-y">
            {threads.map((thread) => (
              <button
                key={thread.id}
                onClick={() => openThread(thread.id)}
                className="w-full text-left p-4 hover:bg-gray-50 transition cursor-pointer"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900 text-sm truncate">
                        {thread.subject}
                      </h3>
                      {thread.unread_replies > 0 && (
                        <span className="min-w-[1.2rem] h-5 px-1.5 flex items-center justify-center rounded-full bg-red-500 text-white text-xs font-semibold">
                          {thread.unread_replies}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5 truncate">
                      {thread.message}
                    </p>
                  </div>
                  <div className="text-right ml-4 shrink-0">
                    <p className="text-xs text-gray-500">
                      {formatDate(thread.last_reply_at || thread.created_at)}
                    </p>
                    {thread.reply_count > 0 && (
                      <p className="text-xs text-gray-400 mt-0.5">
                        {thread.reply_count} {thread.reply_count === 1 ? 'reply' : 'replies'}
                      </p>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}