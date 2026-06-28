import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { streamText, convertToModelMessages, type UIMessage } from 'ai'
import { tools } from './tools'
import { systemPrompt } from './system-prompt'
import { logger } from '../logger'

export interface LLMConfig {
  model: string
  apiKey?: string
}

export interface FallbackOptions {
  models: LLMConfig[]
  onError?: (error: Error, model: string) => void
  maxRetries?: number
}

const DEFAULT_RETRYABLE_STATUS_CODES = [429, 500, 502, 503, 504]

function isRetryableError(error: any): boolean {
  if (error?.status && DEFAULT_RETRYABLE_STATUS_CODES.includes(error.status)) {
    return true
  }
  const message = error?.message?.toLowerCase() ?? ''
  return (
    message.includes('rate limit') ||
    message.includes('quota') ||
    message.includes('resource exhausted') ||
    message.includes('service unavailable') ||
    message.includes('internal server error')
  )
}

export async function withMultiLLMFallback(
  options: FallbackOptions,
  executor: (model: string, provider: ReturnType<typeof createGoogleGenerativeAI>) => Promise<Response>
): Promise<Response> {
  const { models, onError, maxRetries = 1 } = options
  const errors: { model: string; error: Error }[] = []

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    for (const config of models) {
      try {
        logger.debug('Attempting LLM model execution', { model: config.model, attempt })
        const provider = createGoogleGenerativeAI({
          apiKey: config.apiKey || process.env.GEMINI_API_KEY,
        })
        const res = await executor(config.model, provider)
        logger.info('LLM execution succeeded', { model: config.model, attempt })
        return res
      } catch (error: any) {
        const err = error instanceof Error ? error : new Error(String(error))
        logger.warn('LLM model attempt failed', { model: config.model, attempt, error: err.message })

        if (isRetryableError(error) && attempt < maxRetries) {
          onError?.(err, config.model)
          continue
        }

        if (isRetryableError(error) || attempt < maxRetries) {
          errors.push({ model: config.model, error: err })
          onError?.(err, config.model)
          continue
        }

        errors.push({ model: config.model, error: err })
      }
    }
  }

  logger.error('All LLM fallback attempts exhausted', { errorCount: errors.length })
  throw new Error(
    `AI service temporarily unavailable. Please try again later.`
  )
}

export const MODEL_CONFIGS: LLMConfig[] = [
  { model: 'gemini-2.0-flash' },
  { model: 'gemini-1.5-flash' },
  { model: 'gemini-1.5-flash-002' },
  { model: 'gemini-1.5-pro' },
  { model: 'gemini-pro' },
]

export const API_KEYS = [
  process.env.GEMINI_API_KEY_1,
  process.env.GEMINI_API_KEY_2,
  process.env.GEMINI_API_KEY_3,
  process.env.GEMINI_API_KEY_4,
  process.env.GEMINI_API_KEY,
].filter((k): k is string => Boolean(k))

export function buildModelConfigs(): LLMConfig[] {
  const configs: LLMConfig[] = []

  for (const apiKey of API_KEYS) {
    for (const model of MODEL_CONFIGS) {
      configs.push({ ...model, apiKey })
    }
  }

  if (configs.length === 0) {
    configs.push({ model: 'gemini-2.0-flash' })
  }

  return configs
}

export async function streamChat(
  modelName: string,
  provider: ReturnType<typeof createGoogleGenerativeAI>,
  messages: UIMessage[]
) {
  const modelMessages = await convertToModelMessages(messages)
  const result = streamText({
    model: provider(modelName),
    system: systemPrompt,
    messages: modelMessages,
    tools,
    stopWhen: (options: any) => (options.steps?.length ?? 0) >= 5,
  })

  return result.toUIMessageStreamResponse()
}
