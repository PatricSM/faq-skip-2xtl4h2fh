import { streamAgentChat, parseChatStream } from '@/lib/skipAi'
import pb from '@/lib/pocketbase/client'

export async function sendChatMessage(
  message: string,
  history: Array<{ role: 'user' | 'assistant'; content: string }>,
  sessionId: string,
  conversationId: string | null,
  signal: AbortSignal,
  onChunk: (delta: string, full: string) => void,
) {
  const endpoint = `${import.meta.env.VITE_POCKETBASE_URL}/backend/v1/chat_skip_support`
  const apiKey = import.meta.env.VITE_AGENT_API_KEY

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  if (apiKey) {
    headers['Authorization'] = `Bearer ${apiKey}`
  } else if (pb.authStore.isValid && pb.authStore.token) {
    headers['Authorization'] = pb.authStore.token
  }

  const res = await fetch(endpoint, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      message,
      history,
      session_id: sessionId,
      conversation_id: conversationId,
    }),
    signal,
  })

  if (!res.ok) {
    let errorMessage = `API Error: ${res.status}`
    try {
      const errorData = await res.json()
      errorMessage = errorData.error || errorData.message || errorMessage
    } catch {
      // Fallback to default message
    }
    throw new Error(errorMessage)
  }

  const resClone = res.clone()

  try {
    const result = await streamAgentChat(res, {
      onChunk,
      signal,
    })

    return {
      conversationId: res.headers.get('X-Conversation-Id') ?? result.conversation_id,
      messageId: result.message_id,
      content: result.content,
    }
  } catch (err: any) {
    if (err.message?.includes('done event')) {
      let content = ''
      for await (const chunk of parseChatStream(resClone, signal)) {
        if (chunk.choices?.[0]?.delta?.content) {
          content += chunk.choices[0].delta.content
          onChunk(chunk.choices[0].delta.content, content)
        }
      }
      return {
        conversationId: resClone.headers.get('X-Conversation-Id') ?? conversationId,
        messageId: Date.now().toString(),
        content,
      }
    }
    throw err
  }
}
