import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { logUserActivity } from '@/lib/activity'
import OpenAI from 'openai'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    // Accept both JSON and multipart form-data
    const contentType = request.headers.get('content-type') || ''
    let message = '' as string
    let context = '' as string | undefined
    let model = 'gpt-4o-mini' as string
    let attachments: any[] = []

    if (contentType.includes('application/json')) {
      const body = await request.json()
      message = body.message
      context = body.context
      model = body.model || model
      attachments = Array.isArray(body.attachments) ? body.attachments : []
    } else if (contentType.includes('multipart/form-data')) {
      const form = await request.formData()
      message = String(form.get('message') || '')
      context = form.get('context') ? String(form.get('context')) : undefined
      model = form.get('model') ? String(form.get('model')) : model
      // collect file metadata only (no server-side storage here)
      const entries = Array.from(form.entries()) as [string, FormDataEntryValue][]
      entries.forEach(([key, value]) => {
        if (value instanceof Blob) {
          attachments.push({
            name: key,
            type: value.type,
            size: (value as any).size,
          })
        }
      })
    }

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    // Log the chat activity (best-effort)
    try {
      await logUserActivity(
        session,
        'AI_CHAT_REQUEST',
        {
          messageLength: message?.length || 0,
          hasContext: !!context,
          model: model,
          hasAttachments: attachments.length > 0,
          timestamp: new Date().toISOString()
        },
        request
      )
    } catch {}

    try {
      // Try OpenAI first if API key is available
      if (process.env.OPENAI_API_KEY) {
        const openai = new OpenAI({
          apiKey: process.env.OPENAI_API_KEY,
        })

        // Process attachments for context
        let attachmentContext = ''
        if (attachments.length > 0) {
          attachmentContext = '\n\nAttached files:\n'
          attachments.forEach((att: any) => {
            attachmentContext += `- ${att.name} (${att.type})\n`
            if (att.content && att.type.startsWith('text/')) {
              attachmentContext += `Content: ${att.content.slice(0, 1000)}...\n`
            }
          })
        }

        const completion = await openai.chat.completions.create({
          model: model,
          messages: [
            {
              role: "system",
              content: `You are a helpful AI tutor assistant for students. Help with homework, explain concepts clearly, and provide step-by-step solutions. Be encouraging and educational. Keep responses concise but thorough. If files are attached, analyze them and provide relevant help.`
            },
            {
              role: "user",
              content: `${context ? `Context: I'm working on "${context}"\n\n` : ''}${message}${attachmentContext}`
            }
          ],
          max_tokens: model === 'gpt-4o' ? 1200 : 800,
          temperature: 0.7,
        })

        const response = completion.choices[0]?.message?.content || 'I apologize, but I could not generate a response.'

        // Log successful response
        try {
          await logUserActivity(
            session,
            'AI_CHAT_RESPONSE',
            {
              responseLength: response.length,
              model: model,
              success: true,
              hasAttachments: attachments.length > 0
            },
            request
          )
        } catch {}

        return NextResponse.json({
          response,
          model: model,
          source: 'openai'
        })
      }

      // Fallback to Ollama if no OpenAI key
      const ollamaResponse = await fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama3.2:1b',
          prompt: `You are a helpful AI tutor for students. Give concise, clear homework help.

${context ? `Task: ${context}` : ''}

Question: ${message}

Answer:`,
          stream: false,
          options: {
            temperature: 0.5,
            top_p: 0.8,
            max_tokens: 500
          }
        }),
        signal: AbortSignal.timeout(10000)
      })

      if (!ollamaResponse.ok) {
        throw new Error(`Ollama API error: ${ollamaResponse.status}`)
      }

      const ollamaData = await ollamaResponse.json()
      
      try {
        await logUserActivity(
          session,
          'AI_CHAT_RESPONSE',
          {
            responseLength: ollamaData.response?.length || 0,
            model: 'llama3.2:1b',
            success: true
          },
          request
        )
      } catch {}

      return NextResponse.json({
        response: ollamaData.response,
        model: 'llama3.2:1b',
        source: 'ollama'
      })

    } catch (aiError) {
      console.log('AI services not available, using fallback response:', aiError)
      
      // Fallback response when Ollama is not available
      const fallbackResponse = generateFallbackResponse(message, context)
      
      try {
        await logUserActivity(
          session,
          'AI_CHAT_FALLBACK',
          {
            reason: 'ollama_unavailable',
            messageLength: message?.length || 0
          },
          request
        )
      } catch {}

      return NextResponse.json({
        response: fallbackResponse,
        model: 'fallback',
        source: 'built-in',
        note: 'AI service temporarily unavailable. Install Ollama for full AI features.'
      })
    }

  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

function generateFallbackResponse(message: string, context?: string): string {
  const lowerMessage = message.toLowerCase()
  
  // Simple keyword-based responses for common homework help scenarios
  if (lowerMessage.includes('math') || lowerMessage.includes('equation') || lowerMessage.includes('calculate')) {
    return `I'd love to help with your math problem! Here are some general tips:

1. **Break down the problem** - Read it carefully and identify what you're solving for
2. **Show your work** - Write out each step clearly
3. **Check your answer** - Substitute back into the original equation if possible

For specific math help, try:
- Khan Academy (free online lessons)
- Photomath app (step-by-step solutions)
- Your textbook's example problems

${context ? `Since you're working on: "${context}", make sure to review related concepts in your materials.` : ''}

What specific part of the math problem are you stuck on?`
  }

  if (lowerMessage.includes('essay') || lowerMessage.includes('writing') || lowerMessage.includes('paper')) {
    return `Great! I can help you with your writing. Here's a structured approach:

**Essay Writing Steps:**
1. **Brainstorm** - List your main ideas
2. **Create an outline** - Introduction, body paragraphs, conclusion
3. **Write a strong thesis** - Your main argument in 1-2 sentences
4. **Support with evidence** - Use examples, quotes, or data
5. **Revise and edit** - Check grammar, flow, and clarity

**Quick Tips:**
- Start each paragraph with a clear topic sentence
- Use transitions between ideas
- Cite your sources properly
- Read your work aloud to catch errors

${context ? `For your current task: "${context}", focus on how it relates to your assignment requirements.` : ''}

What type of essay are you working on?`
  }

  if (lowerMessage.includes('science') || lowerMessage.includes('experiment') || lowerMessage.includes('hypothesis')) {
    return `Science homework can be exciting! Here's how to approach it:

**Scientific Method:**
1. **Observation** - What did you notice?
2. **Question** - What do you want to find out?
3. **Hypothesis** - Your educated guess
4. **Experiment** - How will you test it?
5. **Analysis** - What do the results show?
6. **Conclusion** - Was your hypothesis correct?

**Study Tips:**
- Draw diagrams to visualize concepts
- Connect new info to what you already know
- Practice explaining concepts in your own words
- Use real-world examples

${context ? `Since you're working on: "${context}", try to relate it to everyday examples you can observe.` : ''}

What science topic are you exploring?`
  }

  // General homework help response
  return `I'm here to help with your homework! While I'm running in basic mode right now, here are some general study strategies:

**Effective Study Techniques:**
1. **Break it down** - Divide large tasks into smaller, manageable parts
2. **Active learning** - Summarize, teach others, or create flashcards
3. **Practice regularly** - A little bit each day is better than cramming
4. **Ask questions** - Don't hesitate to reach out to teachers or classmates
5. **Take breaks** - Your brain needs rest to process information

**Great Free Resources:**
- Khan Academy (math, science, history)
- Coursera (university-level courses)
- YouTube educational channels
- Your local library's online resources

${context ? `For your current task: "${context}", try breaking it into smaller steps and tackle one at a time.` : ''}

What subject are you working on? I can provide more specific guidance!

*Note: For full AI tutoring features, ask your admin to install Ollama with the llama3.2:3b model.*`
}
