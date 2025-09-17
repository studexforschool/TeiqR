'use client'

import { useState, useRef, useEffect } from 'react'
import { MessageCircle, Send, Bot, User, Loader2, AlertCircle, Sparkles } from 'lucide-react'

interface Message {
  id: string
  content: string
  isUser: boolean
  timestamp: Date
  model?: string
  source?: string
  isTyping?: boolean
}

interface AIChatProps {
  currentTask?: {
    title: string
    category: string
    description?: string
  }
}

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

${currentTask ? `I see you're working on "${currentTask.title}" in ${currentTask.category}. How can I help with this task?` : 'What homework can I help you with today?'}`,
      isUser: false,
      timestamp: new Date()
    }
  ])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [typingMessageId, setTypingMessageId] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

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
      
      // Adjust typing speed based on content length
      const delay = words[i].length > 6 ? 100 : 50
      await new Promise(resolve => setTimeout(resolve, delay))
    }
    
    setMessages(prev => prev.map(msg => 
      msg.id === messageId 
        ? { ...msg, isTyping: false }
        : msg
    ))
    setTypingMessageId(null)
  }

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      content: inputMessage.trim(),
      isUser: true,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
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
          context
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
        model: data.model,
        source: data.source,
        isTyping: true
      }

      setMessages(prev => [...prev, aiMessage])
      
      // Start typing animation
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

  const suggestedQuestions = [
    "How do I solve quadratic equations?",
    "Help me structure my essay",
    "Explain photosynthesis simply",
    "What are good study techniques?",
    "How do I cite sources properly?"
  ]

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Current Task Context */}
      {currentTask && (
        <div className="p-4 bg-blue-50 border-b border-blue-200">
          <div className="flex items-center space-x-2">
            <Sparkles className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-800">
              Working on: {currentTask.title} ({currentTask.category})
            </span>
          </div>
        </div>
      )}

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
      <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-gray-50">
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
                <div className="flex items-center justify-between mt-2 text-xs opacity-70">
                  <span>{message.timestamp.toLocaleTimeString()}</span>
                  {message.model && (
                    <span className="ml-2">
                      {message.source === 'openai' ? '🤖 GPT-4o' : '💡 AI'}
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

      {/* Input */}
      <div className="p-4 border-t border-gray-200 bg-white">
        <div className="flex items-end space-x-3">
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
            disabled={!inputMessage.trim() || isLoading}
            className="bg-black text-white p-3 rounded-2xl hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm flex-shrink-0"
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2 text-center">
          Press Enter to send, Shift+Enter for new line
        </p>
      </div>
    </div>
  )
}
