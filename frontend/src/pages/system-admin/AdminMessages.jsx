import { useState, useEffect } from 'react'
import api from '../../api/axios'

export default function AdminMessages() {
  const [threads, setThreads] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedThread, setSelectedThread] = useState(null)
  const [threadMessages, setThreadMessages] = useState([])
  const [threadLoading, setThreadLoading] = useState(false)
  const [replyText, setReplyText] = useState('')
  const [replying, setReplying] = useState(false)

  const fetchThreads = async () => {
    try {
      const { data } = await api.get('/systemAdmin/messages')
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

  const openThread = async (threadId) => {
    setSelectedThread(threadId)
    setThreadLoading(true)
    setThreadMessages([])
    setReplyText('')
    try {
      const { data } = await api.get(`/systemAdmin/messages/${threadId}`)
      setThreadMessages(data.data.messages || [])
      setThreads((prev) =>
        prev.map((t) =>
          t.id === threadId ? { ...t, unread_messages: 0 } : t
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
      const { data } = await api.post(
        `/systemAdmin/messages/${selectedThread}/reply`,
        { message: replyText.trim() }
      )
      setThreadMessages((prev) => [...prev, data.data])
      setReplyText('')
      setThreads((prev) =>
        prev.map((t) =>
          t.id === selectedThread
            ? {
                ...t,
                reply_count: (t.reply_count || 0) + 1,
                last_reply_at: new Date().toISOString(),
              }
            : t
        )
      )
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
            <h2 className="text-xl font-bold text-gray-900">
              {currentThread?.subject}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              From: <span className="font-medium">{currentThread?.municipal_admin_name}</span>
              <span className="text-gray-400 mx-2">·</span>
              <span className="text-gray-500">{currentThread?.municipal_admin_email}</span>
              <span className="text-gray-400 mx-2">·</span>
              <span className="text-gray-500">{currentThread?.kifle_ketema}</span>
            </p>
            <p className="text-xs text-gray-500 mt-0.5">
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
                    msg.sender_role === 'system_admin'
                      ? 'bg-indigo-50 border-l-4 border-indigo-400 ml-8'
                      : 'bg-gray-50 border-l-4 border-gray-400 mr-8'
                  }`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-medium text-gray-800">
                      {msg.sender_role === 'system_admin'
                        ? 'You'
                        : currentThread?.municipal_admin_name || 'Municipal Admin'}
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
      <h1 className="text-2xl font-bold text-gray-900">Admin Messages</h1>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <p className="p-4 text-gray-500 text-sm">Loading...</p>
        ) : threads.length === 0 ? (
          <p className="p-4 text-gray-500 text-sm">
            No messages from municipal admins yet.
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
                      {thread.unread_messages > 0 && (
                        <span className="min-w-[1.2rem] h-5 px-1.5 flex items-center justify-center rounded-full bg-red-500 text-white text-xs font-semibold">
                          {thread.unread_messages}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5 truncate">
                      From:{' '}
                      <span className="font-medium text-gray-700">
                        {thread.municipal_admin_name}
                      </span>{' '}
                      · {thread.kifle_ketema} · {thread.municipal_admin_email}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5 truncate">
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