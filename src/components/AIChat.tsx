'use client'

import { useState, useRef, useEffect } from 'react'
import { MessageCircle, Send, Bot, User, Loader2, AlertCircle, Sparkles, Paperclip, X, ChevronDown, History, Trash2 } from 'lucide-react'

interface Message {
  id: string
  content: string
  isUser: boolean
  timestamp: Date
  model?: string
  source?: string
  isTyping?: boolean
  attachments?: FileAttachment[]
}

interface FileAttachment {
  id: string
  name: string
  size: number
  type: string
  content?: string
}

interface ChatHistory {
  id: string
  title: string
  messages: Message[]
  timestamp: Date
}

interface AIChatProps {
  currentTask?: {
    title: string
    category: string
    description?: string
  }
}

const AI_MODELS = [
  { id: 'gpt-4o', name: 'GPT-4o', description: 'Most capable model' },
  { id: 'gpt-4o-mini', name: 'GPT-4o Mini', description: 'Fast and efficient' },
  { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', description: 'Quick responses' }
]

export default function AIChat({ currentTask }: AIChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      content: `Hi! I'm your AI homework assistant. I can help you with:

• **Math problems** - Step-by-step solutions
• **Essay writing** - Structure and tips  
• **Science concepts** - Clear explanations
• **Study strategies** - Effective learning methods
• **Research help** - Finding reliable sources
• **File analysis** - Upload documents, images, or PDFs

${currentTask ? `I see you're working on "${currentTask.title}" in ${currentTask.category}. How can I help with this task?` : 'What homework can I help you with today?'}`,
      isUser: false,
      timestamp: new Date()
    }
  ])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [typingMessageId, setTypingMessageId] = useState<string | null>(null)
  const [selectedModel, setSelectedModel] = useState('gpt-4o-mini')
  const [showModelSelector, setShowModelSelector] = useState(false)
  const [attachments, setAttachments] = useState<FileAttachment[]>([])
  const [showHistory, setShowHistory] = useState(false)
  const [chatHistory, setChatHistory] = useState<ChatHistory[]>([])
  const [currentChatId, setCurrentChatId] = useState<string | null>(null)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    // Load chat history from localStorage
    const savedHistory = localStorage.getItem('studex-chat-history')
    if (savedHistory) {
      setChatHistory(JSON.parse(savedHistory))
    }
  }, [])

  const saveChatHistory = (history: ChatHistory[]) => {
    localStorage.setItem('studex-chat-history', JSON.stringify(history))
    setChatHistory(history)
  }

  const typeMessage = async (messageId: string, content: string) => {
    setTypingMessageId(messageId)
    const words = content.split(' ')
    let currentContent = ''
    
    for (let i = 0; i < words.length; i++) {
      currentContent += (i > 0 ? ' ' : '') + words[i]
      
      setMessages(prev => prev.map(msg => 
        msg.id === messageId 
          ? { ...msg, content: currentContent, isTyping: true }
          : msg
      ))
      
      const delay = words[i].length > 6 ? 80 : 40
      await new Promise(resolve => setTimeout(resolve, delay))
    }
    
    setMessages(prev => prev.map(msg => 
      msg.id === messageId 
        ? { ...msg, isTyping: false }
        : msg
    ))
    setTypingMessageId(null)
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files) return

    Array.from(files).forEach(file => {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        setError('File size must be less than 10MB')
        return
      }

      const reader = new FileReader()
      reader.onload = (e) => {
        const attachment: FileAttachment = {
          id: Date.now().toString() + Math.random(),
          name: file.name,
          size: file.size,
          type: file.type,
          content: e.target?.result as string
        }
        setAttachments(prev => [...prev, attachment])
      }
      
      if (file.type.startsWith('text/') || file.type === 'application/pdf') {
        reader.readAsText(file)
      } else if (file.type.startsWith('image/')) {
        reader.readAsDataURL(file)
      }
    })
  }

  const removeAttachment = (id: string) => {
    setAttachments(prev => prev.filter(att => att.id !== id))
  }

  const startNewChat = () => {
    if (messages.length > 1) {
      // Save current chat to history
      const chatTitle = messages.find(m => m.isUser)?.content.slice(0, 50) + '...' || 'New Chat'
      const newHistory: ChatHistory = {
        id: Date.now().toString(),
        title: chatTitle,
        messages: [...messages],
        timestamp: new Date()
      }
      saveChatHistory([newHistory, ...chatHistory])
    }
    
    setMessages([{
      id: 'welcome',
      content: `Hi! I'm your AI homework assistant. I can help you with:

• **Math problems** - Step-by-step solutions
• **Essay writing** - Structure and tips  
• **Science concepts** - Clear explanations
• **Study strategies** - Effective learning methods
• **Research help** - Finding reliable sources
• **File analysis** - Upload documents, images, or PDFs

${currentTask ? `I see you're working on "${currentTask.title}" in ${currentTask.category}. How can I help with this task?` : 'What homework can I help you with today?'}`,
      isUser: false,
      timestamp: new Date()
    }])
    setCurrentChatId(null)
    setAttachments([])
  }

  const loadChatHistory = (chat: ChatHistory) => {
    setMessages(chat.messages)
    setCurrentChatId(chat.id)
    setShowHistory(false)
  }

  const deleteChatHistory = (chatId: string) => {
    const updatedHistory = chatHistory.filter(chat => chat.id !== chatId)
    saveChatHistory(updatedHistory)
  }

  const handleSendMessage = async () => {
    if ((!inputMessage.trim() && attachments.length === 0) || isLoading) return

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      content: inputMessage.trim(),
      isUser: true,
      timestamp: new Date(),
      attachments: [...attachments]
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setAttachments([])
    setIsLoading(true)
    setError('')

    try {
      const context = currentTask ? 
        `Current task: ${currentTask.title} (${currentTask.category})${currentTask.description ? ` - ${currentTask.description}` : ''}` 
        : undefined

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: inputMessage.trim(),
          context,
          model: selectedModel,
          attachments: attachments.map(att => ({
            name: att.name,
            type: att.type,
            content: att.content
          }))
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      if (data.error) {
        throw new Error(data.error)
      }

      const aiMessageId = `ai-${Date.now()}`
      const aiMessage: Message = {
        id: aiMessageId,
        content: '',
        isUser: false,
        timestamp: new Date(),
        model: selectedModel,
        source: 'openai',
        isTyping: true
      }

      setMessages(prev => [...prev, aiMessage])
      await typeMessage(aiMessageId, data.response)

      if (data.note) {
        setError(data.note)
      }

    } catch (error) {
      console.error('Chat error:', error)
      setError('Sorry, I encountered an error. Please try again.')
      
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        content: 'I apologize, but I\'m having trouble responding right now. Please try asking your question again, or consider these study resources:\n\n• Khan Academy for math and science\n• Purdue OWL for writing help\n• Your textbook and class notes\n• Study groups with classmates',
        isUser: false,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const formatMessage = (content: string) => {
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/•/g, '•')
      .split('\n')
      .map((line, index) => (
        <div key={index} dangerouslySetInnerHTML={{ __html: line || '<br>' }} />
      ))
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const suggestedQuestions = [
    "How can I prioritize my tasks effectively?",
    "What's the best way to break down large projects?",
    "Help me create a productive daily routine",
    "How do I manage deadlines and avoid procrastination?",
    "What are effective time management techniques?"
  ]

  return (
    <div className="flex h-full bg-gray-50 dark:bg-gray-900">
      {/* Chat History Sidebar */}
      <div className={`${showHistory ? 'w-80' : 'w-0'} transition-all duration-300 overflow-hidden bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col`}>
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 dark:text-white">Chat History</h3>
            <button
              onClick={() => setShowHistory(false)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <button
            onClick={startNewChat}
            className="w-full bg-black dark:bg-white text-white dark:text-black px-4 py-2 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors text-sm"
          >
            + New Chat
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {chatHistory.map((chat) => (
            <div key={chat.id} className="group">
              <button
                onClick={() => loadChatHistory(chat)}
                className={`w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors ${
                  currentChatId === chat.id ? 'bg-gray-100' : ''
                }`}
              >
                <div className="font-medium text-sm text-gray-900 truncate">
                  {chat.title}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {chat.timestamp.toLocaleDateString()}
                </div>
              </button>
              <button
                onClick={() => deleteChatHistory(chat.id)}
                className="opacity-0 group-hover:opacity-100 absolute right-2 top-2 text-gray-400 hover:text-red-500 transition-all"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                <History className="h-5 w-5" />
              </button>
              
              {/* Model Selector */}
              <div className="relative">
                <button
                  onClick={() => setShowModelSelector(!showModelSelector)}
                  className="flex items-center space-x-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  <Bot className="h-4 w-4" />
                  <span className="text-sm font-medium">
                    {AI_MODELS.find(m => m.id === selectedModel)?.name}
                  </span>
                  <ChevronDown className="h-4 w-4" />
                </button>
                
                {showModelSelector && (
                  <div className="absolute top-full left-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-10">
                    {AI_MODELS.map((model) => (
                      <button
                        key={model.id}
                        onClick={() => {
                          setSelectedModel(model.id)
                          setShowModelSelector(false)
                        }}
                        className={`w-full text-left p-3 hover:bg-gray-50 transition-colors first:rounded-t-lg last:rounded-b-lg ${
                          selectedModel === model.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                        }`}
                      >
                        <div className="font-medium text-sm">{model.name}</div>
                        <div className="text-xs text-gray-500">{model.description}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Current Task Context */}
            {currentTask && (
              <div className="flex items-center space-x-2 bg-blue-50 px-3 py-2 rounded-lg">
                <Sparkles className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">
                  {currentTask.title} ({currentTask.category})
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="p-3 bg-red-50 border-b border-red-200">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <span className="text-sm text-red-800">{error}</span>
            </div>
          </div>
        )}

        {/* Messages */}
        <div 
          ref={messagesContainerRef}
          className="flex-1 overflow-y-auto p-4 space-y-6"
        >
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`flex items-start space-x-3 max-w-[80%] ${
                  message.isUser ? 'flex-row-reverse space-x-reverse' : ''
                }`}
              >
                <div
                  className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                    message.isUser
                      ? 'bg-black text-white'
                      : 'bg-green-600 text-white'
                  }`}
                >
                  {message.isUser ? (
                    <User className="h-4 w-4" />
                  ) : (
                    <Bot className="h-4 w-4" />
                  )}
                </div>
                <div
                  className={`rounded-2xl px-4 py-3 shadow-sm ${
                    message.isUser
                      ? 'bg-black text-white'
                      : 'bg-white text-gray-900 border border-gray-200'
                  }`}
                >
                  <div className="text-sm leading-relaxed">
                    {formatMessage(message.content)}
                    {message.isTyping && (
                      <span className="inline-block w-2 h-4 bg-gray-400 ml-1 animate-pulse" />
                    )}
                  </div>
                  
                  {/* Attachments */}
                  {message.attachments && message.attachments.length > 0 && (
                    <div className="mt-2 space-y-2">
                      {message.attachments.map((attachment) => (
                        <div key={attachment.id} className="flex items-center space-x-2 p-2 bg-gray-100 rounded-lg">
                          <Paperclip className="h-4 w-4 text-gray-500" />
                          <span className="text-xs font-medium">{attachment.name}</span>
                          <span className="text-xs text-gray-500">({formatFileSize(attachment.size)})</span>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between mt-2 text-xs opacity-70">
                    <span>{message.timestamp.toLocaleTimeString()}</span>
                    {message.model && (
                      <span className="ml-2">
                        {AI_MODELS.find(m => m.id === message.model)?.name || message.model}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Suggested Questions */}
          {messages.length === 1 && !isLoading && (
            <div className="mt-6">
              <p className="text-sm text-gray-600 mb-3 font-medium">Try asking:</p>
              <div className="grid grid-cols-1 gap-2">
                {suggestedQuestions.map((question, index) => (
                  <button
                    key={index}
                    onClick={() => setInputMessage(question)}
                    className="text-left p-3 bg-white hover:bg-gray-50 rounded-lg border border-gray-200 text-sm text-gray-700 transition-colors shadow-sm"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Loading indicator */}
          {isLoading && (
            <div className="flex justify-start">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center">
                  <Bot className="h-4 w-4 text-white" />
                </div>
                <div className="bg-white rounded-2xl px-4 py-3 border border-gray-200 shadow-sm">
                  <div className="flex items-center space-x-2">
                    <Loader2 className="h-4 w-4 animate-spin text-gray-600" />
                    <span className="text-sm text-gray-700">Thinking...</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-gray-200 bg-white">
          {/* File Attachments */}
          {attachments.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-2">
              {attachments.map((attachment) => (
                <div key={attachment.id} className="flex items-center space-x-2 bg-gray-100 px-3 py-2 rounded-lg">
                  <Paperclip className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium">{attachment.name}</span>
                  <span className="text-xs text-gray-500">({formatFileSize(attachment.size)})</span>
                  <button
                    onClick={() => removeAttachment(attachment.id)}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-end space-x-3">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-3 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-2xl transition-all"
              disabled={isLoading}
            >
              <Paperclip className="h-5 w-5" />
            </button>
            
            <div className="flex-1">
              <textarea
                ref={inputRef}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me about your homework..."
                className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-black focus:border-black resize-none bg-white text-gray-900 placeholder-gray-500"
                rows={1}
                style={{
                  minHeight: '48px',
                  maxHeight: '120px',
                  height: 'auto'
                }}
                disabled={isLoading}
              />
            </div>
            
            <button
              onClick={handleSendMessage}
              disabled={(!inputMessage.trim() && attachments.length === 0) || isLoading}
              className="bg-black text-white p-3 rounded-2xl hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm flex-shrink-0"
            >
              <Send className="h-5 w-5" />
            </button>
          </div>
          
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileUpload}
            className="hidden"
            accept=".txt,.pdf,.doc,.docx,.jpg,.jpeg,.png,.gif"
          />
          
          <p className="text-xs text-gray-500 mt-2 text-center">
            Press Enter to send, Shift+Enter for new line • Upload files up to 10MB
          </p>
        </div>
      </div>
    </div>
  )
}
