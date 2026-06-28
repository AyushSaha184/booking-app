import { NextResponse } from 'next/server'
import { streamText } from 'ai'
import { tools } from '@/lib/llm/tools'
import { systemPrompt } from '@/lib/llm/system-prompt'
import { withMultiLLMFallback, buildModelConfigs } from '@/lib/llm/multillm'
import { checkRateLimit } from '@/lib/ratelimit'
import { validateRequestSize, sanitizeUserInput } from '@/lib/validation'

export const maxDuration = 60

function getClientIp(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for')
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  const realIp = req.headers.get('x-real-ip')
  if (realIp) {
    return realIp
  }
  return '127.0.0.1'
}

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req)

    const { success, remaining, reset } = await checkRateLimit(ip)

    if (!success) {
      const response = NextResponse.json(
        { error: 'Rate limit exceeded. Please wait before sending more messages.' },
        { status: 429 }
      )
      response.headers.set('X-RateLimit-Remaining', String(remaining))
      response.headers.set('X-RateLimit-Reset', String(reset))
      return response
    }

    const rawBody = await req.text()

    if (!validateRequestSize(rawBody, 500_000)) {
      return NextResponse.json({ error: 'Request too large' }, { status: 413 })
    }

    let parsed: { messages?: any[] }
    try {
      parsed = JSON.parse(rawBody)
    } catch {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
    }

    const messages = parsed.messages

    if (!Array.isArray(messages) || messages.length > 100) {
      return NextResponse.json({ error: 'Invalid messages format' }, { status: 400 })
    }

    const sanitizedMessages = messages.map((msg: any) => {
      let content: string | any[]

      if (Array.isArray(msg.parts)) {
        content = msg.parts.map((p: any) => {
          if (p?.type === 'text' && typeof p.text === 'string') {
            return { type: 'text', text: sanitizeUserInput(p.text) }
          }
          return p
        })
      } else if (typeof msg.content === 'string') {
        content = sanitizeUserInput(msg.content)
      } else {
        content = msg.content || ''
      }

      return {
        role: msg.role,
        content: content,
      }
    })

    const modelConfigs = buildModelConfigs()

    const result = await withMultiLLMFallback(
      {
        models: modelConfigs,
        onError: (error, model) => {
          console.warn(`Model ${model} failed: ${error.message}. Trying next...`)
        },
        maxRetries: 1,
      },
      async (model, provider) => {
        const modelInstance = provider(model)

        return streamText({
          model: modelInstance,
          system: systemPrompt,
          messages: sanitizedMessages,
          tools,
        })
      }
    )

    return result.toUIMessageStreamResponse()

  } catch (err: unknown) {
    console.error('Chat API error:', err)
    const message = err instanceof Error ? err.message : 'Internal server error'

    if (message.includes('All models failed')) {
      return NextResponse.json(
        { error: 'AI service temporarily unavailable. Please try again.' },
        { status: 503 }
      )
    }

    return NextResponse.json(
      { error: 'An error occurred processing your request' },
      { status: 500 }
    )
  }
}