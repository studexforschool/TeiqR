  'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Send, Paperclip, X, Loader2, User, Bot, Plus, Trash2, Menu } from 'lucide-react'

interface Message {
  id: string
  content: string
  role: 'user' | 'assistant'
  timestamp: Date
}

interface Conversation {
  id: string
  title: string
  messages: Message[]
  createdAt: string
  updatedAt: string
}

// Lightweight Markdown renderer for assistant messages
const renderContent = (text: string) => {
  const lines = text.split(/\r?\n/)
  const elements: JSX.Element[] = []
  let inCode = false
  let codeBuffer: string[] = []

  const pushCodeBlock = () => {
    if (codeBuffer.length === 0) return
    elements.push(
      <pre key={`code-${elements.length}`} className="mt-2 mb-3 overflow-auto rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm p-3">
        <code>{codeBuffer.join('\n')}</code>
      </pre>
    )
    codeBuffer = []
  }

  lines.forEach((raw, idx) => {
    const line = raw as string
    // code fence
    const fence = line.match(/^```(.*)$/)
    if (fence) {
      if (!inCode) {
        inCode = true
      } else {
        inCode = false
        pushCodeBlock()
      }
      return
    }
    if (inCode) {
      codeBuffer.push(line)
      return
    }

    // headings
    const h = line.match(/^(#{1,3})\s+(.*)$/)
    if (h) {
      const level = h[1].length
      const content = h[2]
      const HeadingTag = (level === 1 ? 'h3' : level === 2 ? 'h4' : 'h5') as keyof JSX.IntrinsicElements
      elements.push(
        React.createElement(
          HeadingTag,
          { key: `h-${idx}`, className: 'font-semibold text-gray-900 dark:text-white mt-3 mb-1' },
          content
        )
      )
      return
    }

    // lists
    if (/^\s*[-*]\s+/.test(line)) {
      // gather consecutive list items
      const items: string[] = []
      let j = idx
      while (j < lines.length && /^\s*[-*]\s+/.test(lines[j] as string)) {
        items.push((lines[j] as string).replace(/^\s*[-*]\s+/, ''))
        ;(lines as any)[j] = ''
        j++
      }
      elements.push(
        <ul key={`ul-${idx}`} className="list-disc pl-5 space-y-1 text-gray-800 dark:text-gray-100">
          {items.map((it, k) => <li key={k}>{it}</li>)}
        </ul>
      )
      return
    }
    if (/^\s*\d+\.\s+/.test(line)) {
      const items: string[] = []
      let j = idx
      while (j < lines.length && /^\s*\d+\.\s+/.test(lines[j] as string)) {
        items.push((lines[j] as string).replace(/^\s*\d+\.\s+/, ''))
        ;(lines as any)[j] = ''
        j++
      }
      elements.push(
        <ol key={`ol-${idx}`} className="list-decimal pl-5 space-y-1 text-gray-800 dark:text-gray-100">
          {items.map((it, k) => <li key={k}>{it}</li>)}
        </ol>
      )
      return
    }

    // inline code and emphasis
    const withInline = line
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/\*([^*]+)\*/g, '<em>$1</em>')

    if (withInline.trim().length > 0) {
      elements.push(
        <p key={`p-${idx}`} className="text-gray-800 dark:text-gray-100 leading-relaxed" dangerouslySetInnerHTML={{ __html: withInline }} />
      )
    } else {
      elements.push(<div key={`sp-${idx}`} className="h-2" />)
    }
  })

  // flush trailing codeblock
  if (inCode) pushCodeBlock()
  return <div className="prose prose-sm dark:prose-invert max-w-none">{elements}</div>
}

export default function AIAssistant() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [model, setModel] = useState<string>('gpt-4o-mini')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [fullscreen, setFullscreen] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  // Load persisted state
  useEffect(() => {
    try {
      const saved = localStorage.getItem('teiqr-conversations')
      const savedModel = localStorage.getItem('teiqr-ai-model')
      if (saved) {
        const parsed: Conversation[] = JSON.parse(saved)
        // revive dates for messages
        parsed.forEach(conv => {
          conv.messages = conv.messages.map(m => ({ ...m, timestamp: new Date(m.timestamp) }))
        })
        setConversations(parsed)
        if (parsed.length > 0) setSelectedId(parsed[0].id)
      }
      if (savedModel) setModel(savedModel)
    } catch {}
  }, [])

  // Persist conversations
  useEffect(() => {
    try {
      localStorage.setItem('teiqr-conversations', JSON.stringify(conversations))
    } catch {}
  }, [conversations])

  // Persist model
  useEffect(() => {
    try {
      localStorage.setItem('teiqr-ai-model', model)
    } catch {}
  }, [model])

  // Auto scroll on message change
  useEffect(() => {
    scrollToBottom()
  }, [conversations, selectedId])

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.size <= 10 * 1024 * 1024) { // 10MB limit
      setUploadedFile(file)
    }
  }

  const removeFile = () => {
    setUploadedFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() && !uploadedFile) return

    // ensure a conversation exists
    const now = new Date()
    let convId = selectedId
    if (!convId) {
      const newConv: Conversation = {
        id: `${now.getTime()}`,
        title: input.trim().slice(0, 40) || 'New Chat',
        messages: [],
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      }
      setConversations(prev => [newConv, ...prev])
      convId = newConv.id
      setSelectedId(convId)
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      role: 'user',
      timestamp: now,
    }

    setConversations(prev => prev.map(c =>
      c.id === convId
        ? { ...c, messages: [...c.messages, userMessage], title: c.messages.length === 0 && input ? input.slice(0, 40) : c.title, updatedAt: now.toISOString() }
        : c
    ))
    setInput('')
    setIsLoading(true)

    try {
      const formData = new FormData()
      formData.append('message', input)
      if (uploadedFile) {
        formData.append('file', uploadedFile)
      }

      // include model in request
      formData.append('model', model)
      const response = await fetch('/api/chat', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json().catch(() => ({} as any))
      if (response.ok) {
        const text = data?.response || 'No response received.'
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: text,
          role: 'assistant',
          timestamp: new Date(),
        }
        const aid = convId!
        setConversations(prev => prev.map(c =>
          c.id === aid
            ? { ...c, messages: [...c.messages, assistantMessage], updatedAt: new Date().toISOString() }
            : c
        ))
      } else {
        const errText = data?.error || `Request failed (${response.status})`
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: `Error: ${errText}`,
          role: 'assistant',
          timestamp: new Date(),
        }
        const aid = convId!
        setConversations(prev => prev.map(c =>
          c.id === aid
            ? { ...c, messages: [...c.messages, assistantMessage], updatedAt: new Date().toISOString() }
            : c
        ))
      }
    } catch (error) {
      console.error('Error sending message:', error)
    } finally {
      setIsLoading(false)
      setUploadedFile(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const suggestedPrompts = [
    "How can I improve my productivity?",
    "Help me prioritize my tasks",
    "What's the best way to manage deadlines?",
    "Give me time management tips"
  ]

  const models = [
    { id: 'gpt-4o', label: 'GPT-4o' },
    { id: 'gpt-4o-mini', label: 'GPT-4o mini' },
    { id: 'o3-mini', label: 'o3-mini (Reasoning)' },
  ]

  const current = conversations.find(c => c.id === selectedId) || null
  const messages = current?.messages ?? []

  const newChat = () => {
    const now = new Date()
    const newConv: Conversation = {
      id: `${now.getTime()}`,
      title: 'New Chat',
      messages: [],
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    }
    setConversations(prev => [newConv, ...prev])
    setSelectedId(newConv.id)
    setSidebarOpen(false)
  }

  const deleteChat = (id: string) => {
    setConversations(prev => prev.filter(c => c.id !== id))
    if (selectedId === id) {
      const next = conversations.find(c => c.id !== id)
      setSelectedId(next ? next.id : null)
    }
  }

  return (
    <div className={`${fullscreen ? 'fixed inset-0 z-50' : ''} flex min-h-[70vh] md:h-[calc(100vh-12rem)] bg-white dark:bg-gray-900`}>
      {/* Sidebar - Chat History */}
      <aside className="w-72 flex-shrink-0 border-r border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/40 hidden md:flex md:flex-col"> 
        <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wide">History</h2>
          <button onClick={newChat} className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-md bg-gray-900 text-white dark:bg-white dark:text-gray-900 hover:opacity-90">
            <Plus className="w-4 h-4" /> New
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-2">
          {conversations.length === 0 ? (
            <p className="text-xs text-gray-500 px-2">No conversations yet</p>
          ) : (
            conversations
              .slice()
              .sort((a,b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
              .map(conv => (
                <div key={conv.id} className={`group rounded-lg border ${selectedId === conv.id ? 'border-gray-900 dark:border-white bg-white dark:bg-gray-800' : 'border-gray-200 dark:border-gray-800 hover:bg-white/60 dark:hover:bg-gray-800/60'} transition-colors`}> 
                  <button onClick={() => { setSelectedId(conv.id); setSidebarOpen(false) }} className="w-full text-left px-3 py-2">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{conv.title || 'Untitled'}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{new Date(conv.updatedAt).toLocaleString()}</p>
                  </button>
                  <div className="px-3 pb-2 hidden group-hover:flex justify-end">
                    <button onClick={() => deleteChat(conv.id)} className="text-xs text-red-600 hover:text-red-700 inline-flex items-center gap-1">
                      <Trash2 className="w-3 h-3" /> Delete
                    </button>
                  </div>
                </div>
              ))
          )}
        </div>
      </aside>

      {/* Mobile sidebar toggle */}
      <div className="md:hidden fixed bottom-24 right-4 z-30">
        <button onClick={() => setSidebarOpen(v => !v)} className="p-3 rounded-full shadow-lg bg-gray-900 text-white dark:bg-white dark:text-gray-900">
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {sidebarOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setSidebarOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-72 bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col">
            <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wide">History</h2>
              <button onClick={newChat} className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-md bg-gray-900 text-white dark:bg-white dark:text-gray-900 hover:opacity-90">
                <Plus className="w-4 h-4" /> New
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-2">
              {conversations.length === 0 ? (
                <p className="text-xs text-gray-500 px-2">No conversations yet</p>
              ) : (
                conversations
                  .slice()
                  .sort((a,b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
                  .map(conv => (
                    <button key={conv.id} onClick={() => { setSelectedId(conv.id); setSidebarOpen(false) }} className={`w-full text-left px-3 py-2 rounded-lg border ${selectedId === conv.id ? 'border-gray-900 dark:border-white bg-white dark:bg-gray-800' : 'border-gray-200 dark:border-gray-800'} transition-colors`}>
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{conv.title || 'Untitled'}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{new Date(conv.updatedAt).toLocaleString()}</p>
                    </button>
                  ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main panel */}
      <section className="flex-1 flex flex-col min-w-0">
        {/* Header with model selector */}
        <div className="border-b border-gray-200 dark:border-gray-800 p-4 md:p-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Assistant</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Get help with your tasks and productivity</p>
          </div>
          <div className="flex items-center gap-3">
            <select value={model} onChange={(e) => setModel(e.target.value)} className="px-3 py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm">
              {models.map(m => (
                <option key={m.id} value={m.id}>{m.label}</option>
              ))}
            </select>
            <button onClick={() => setFullscreen(f => !f)} className="inline-flex md:hidden items-center gap-2 px-3 py-2 rounded-md border border-gray-300 dark:border-gray-700 text-sm text-gray-700 dark:text-gray-200">
              {fullscreen ? 'Close' : 'Expand'}
            </button>
            <button onClick={newChat} className="hidden md:inline-flex items-center gap-2 px-3 py-2 rounded-md bg-gray-900 text-white dark:bg-white dark:text-gray-900 text-sm">
              <Plus className="w-4 h-4" /> New Chat
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6" aria-live="polite">
          {messages.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <Bot className="w-8 h-8 text-gray-600 dark:text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">How can I help you today?</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">Ask me anything about productivity, task management, or get help with your work.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl mx-auto">
                {suggestedPrompts.map((prompt, index) => (
                  <button
                    key={index}
                    onClick={() => setInput(prompt)}
                    className="p-3 text-left text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors border border-gray-200 dark:border-gray-700"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((message) => (
              <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex max-w-3xl ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className={`flex-shrink-0 ${message.role === 'user' ? 'ml-3' : 'mr-3'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      message.role === 'user' 
                        ? 'bg-gray-900 dark:bg-white' 
                        : 'bg-gray-100 dark:bg-gray-800'
                    }`}>
                      {message.role === 'user' ? (
                        <User className="w-4 h-4 text-white dark:text-gray-900" />
                      ) : (
                        <Bot className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                      )}
                    </div>
                  </div>
                  <div className={`px-4 py-3 rounded-2xl ${
                    message.role === 'user'
                      ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
                  }`}>
                    {message.role === 'assistant' ? (
                    <div>{renderContent(message.content)}</div>
                  ) : (
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                  )}
                    <p className={`text-xs mt-2 ${
                      message.role === 'user' 
                        ? 'text-gray-300 dark:text-gray-600' 
                        : 'text-gray-500 dark:text-gray-400'
                    }`}>
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="flex max-w-3xl">
                <div className="mr-3">
                  <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                    <Bot className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  </div>
                </div>
                <div className="px-4 py-3 rounded-2xl bg-gray-100 dark:bg-gray-800">
                  <Loader2 className="w-4 h-4 animate-spin text-gray-600 dark:text-gray-400" />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t border-gray-200 dark:border-gray-800 p-4 md:p-6">
          {uploadedFile && (
            <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg flex items-center justify-between">
              <div className="flex items-center">
                <Paperclip className="w-4 h-4 text-gray-500 dark:text-gray-400 mr-2" />
                <span className="text-sm text-gray-700 dark:text-gray-300">{uploadedFile.name}</span>
              </div>
              <button onClick={removeFile} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="flex items-end gap-3">
            <div className="flex-1">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask me anything..."
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none"
                rows={1}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleSubmit(e)
                  }
                }}
              />
            </div>
            
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileUpload}
              accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg"
              className="hidden"
            />
            
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-3 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
            >
              <Paperclip className="w-5 h-5" />
            </button>
            
            <button
              type="submit"
              disabled={(!input.trim() && !uploadedFile) || isLoading}
              className="p-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl hover:bg-gray-800 dark:hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>
      </section>
    </div>
  )
}
