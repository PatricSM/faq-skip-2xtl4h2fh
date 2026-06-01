import { useState, useRef, useEffect } from 'react'
import { MessageCircle, X, Send, Sparkles, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { sendChatMessage } from '@/services/chat'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
}

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        'Olá! Sou o assistente de suporte do Skip. Conte qual é a sua dúvida ou o que está acontecendo no seu projeto, e tento te ajudar com base nas perguntas mais frequentes da plataforma.',
    },
  ])
  const [inputValue, setInputValue] = useState('')
  const [isThinking, setIsThinking] = useState(false)
  const [conversationId, setConversationId] = useState<string | null>(null)

  const [sessionId] = useState(() => {
    let sid = localStorage.getItem('skip_chat_session')
    if (!sid) {
      sid = Math.random().toString(36).substring(2, 15)
      localStorage.setItem('skip_chat_session', sid)
    }
    return sid
  })

  const scrollRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isThinking])

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [])

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value)
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 128)}px`
    }
  }

  const handleSend = async () => {
    if (!inputValue.trim() || isThinking) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue.trim(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputValue('')
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
    setIsThinking(true)

    abortControllerRef.current = new AbortController()

    let currentAssistantMessage = ''
    const assistantId = (Date.now() + 1).toString()

    setMessages((prev) => [...prev, { id: assistantId, role: 'assistant', content: '' }])

    try {
      const result = await sendChatMessage(
        userMessage.content,
        messages.map((m) => ({ role: m.role, content: m.content })),
        sessionId,
        conversationId,
        abortControllerRef.current.signal,
        (delta, full) => {
          currentAssistantMessage = full
          setMessages((prev) =>
            prev.map((m) => (m.id === assistantId ? { ...m, content: full } : m)),
          )
          setIsThinking(false)
        },
      )
      if (result.conversationId) {
        setConversationId(result.conversationId)
      }
    } catch (err: any) {
      if (err.name === 'AbortError') return
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId
            ? {
                ...m,
                content:
                  'Desculpe, ocorreu um erro ao tentar processar sua mensagem. Tente novamente mais tarde.',
              }
            : m,
        ),
      )
    } finally {
      setIsThinking(false)
      abortControllerRef.current = null
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={cn(
          'fixed bottom-6 right-6 z-40 flex items-center justify-center gap-2 rounded-full bg-brand-primary text-white shadow-glow transition-all duration-300 hover:scale-105',
          isOpen ? 'scale-0 opacity-0' : 'scale-100 opacity-100',
          'h-14 px-5',
        )}
      >
        <MessageCircle className="h-6 w-6" />
        <span className="font-medium hidden sm:inline">Falar com suporte</span>
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 sm:hidden backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      <div
        className={cn(
          'fixed z-50 flex flex-col overflow-hidden transition-all duration-300 ease-out origin-bottom-right',
          'bottom-24 right-4 sm:right-6 h-[calc(100dvh-120px)] max-h-[640px] w-[calc(100vw-32px)] sm:w-[420px]',
          'rounded-2xl border border-brand-border bg-brand-bg/95 backdrop-blur-xl shadow-2xl',
          isOpen
            ? 'translate-y-0 opacity-100 scale-100'
            : 'pointer-events-none translate-y-10 opacity-0 scale-95',
        )}
      >
        <div className="flex items-center justify-between border-b border-brand-border bg-brand-bg/50 p-4 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-primary to-indigo-600 shadow-glow">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-brand-textPrimary">Suporte Skip</h3>
              <p className="text-xs text-brand-textMuted">
                Assistente baseado nas perguntas frequentes
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="rounded-full p-2 text-brand-textMuted hover:bg-white/5 hover:text-brand-textPrimary transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((m) => {
            const isUser = m.role === 'user'
            const hasEmail = !isUser && /duvidas@adapta\.org/i.test(m.content)

            return (
              <div
                key={m.id}
                className={cn('flex w-full', isUser ? 'justify-end' : 'justify-start')}
              >
                <div
                  className={cn(
                    'max-w-[85%] rounded-2xl px-4 py-3 text-sm',
                    isUser
                      ? 'bg-brand-primary text-white rounded-br-sm'
                      : 'bg-white/[0.05] border border-brand-border text-brand-textPrimary rounded-bl-sm',
                  )}
                >
                  <MessageContent content={m.content} isUser={isUser} />
                  {hasEmail && (
                    <a
                      href="mailto:duvidas@adapta.org?subject=Suporte%20FAQ%20Skip&body=Nome:%0AProjeto:%0ADescri%C3%A7%C3%A3o%20do%20problema:%0A"
                      className="mt-3 inline-flex items-center justify-center gap-2 rounded-md font-medium bg-brand-primary text-white h-9 px-4 w-full transition-opacity hover:opacity-90"
                    >
                      Enviar e-mail ao suporte
                    </a>
                  )}
                </div>
              </div>
            )
          })}
          {isThinking && (
            <div className="flex w-full justify-start">
              <div className="max-w-[85%] rounded-2xl rounded-bl-sm bg-white/[0.05] border border-brand-border px-4 py-3 text-sm text-brand-textMuted flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-brand-primary" />
                <span>Pensando...</span>
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-brand-border p-4 bg-brand-bg">
          <div className="relative flex items-end overflow-hidden rounded-xl border border-brand-border bg-white/[0.02] focus-within:border-brand-primary/50 focus-within:bg-white/[0.04] transition-colors">
            <textarea
              ref={textareaRef}
              value={inputValue}
              onChange={handleInput}
              onKeyDown={handleKeyDown}
              placeholder="Digite sua dúvida..."
              className="max-h-32 min-h-[48px] w-full resize-none bg-transparent px-4 py-3 text-sm text-brand-textPrimary placeholder:text-brand-textMuted focus:outline-none"
              rows={1}
            />
            <button
              onClick={handleSend}
              disabled={!inputValue.trim() || isThinking}
              className="mb-1 mr-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-brand-primary transition-colors hover:bg-brand-primary/10 disabled:opacity-50 disabled:hover:bg-transparent"
            >
              <Send className="h-5 w-5" />
            </button>
          </div>
          <div className="mt-2 text-center text-[10px] text-brand-textMuted">
            O assistente pode cometer erros. Considere verificar as informações.
          </div>
        </div>
      </div>
    </>
  )
}

function formatMarkdown(text: string, isUser: boolean) {
  if (!text) return ''

  let html = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

  const codeBlocks: string[] = []
  html = html.replace(/```([\s\S]*?)```/g, (_, code) => {
    codeBlocks.push(
      `<pre class="bg-black/30 p-3 rounded-md overflow-x-auto my-2 border border-white/10 text-xs font-mono leading-relaxed text-brand-textPrimary"><code>${code.trim()}</code></pre>`,
    )
    return `__CODE_BLOCK_${codeBlocks.length - 1}__`
  })

  const codeClass = isUser
    ? 'font-mono bg-black/20 px-1.5 py-0.5 rounded text-[0.85em]'
    : 'font-mono text-brand-primary bg-brand-primary/10 border border-brand-primary/20 px-1.5 py-0.5 rounded text-[0.85em]'

  const inlineCodes: string[] = []
  html = html.replace(/`([^`]+)`/g, (_, code) => {
    inlineCodes.push(`<code class="${codeClass}">${code}</code>`)
    return `__INLINE_CODE_${inlineCodes.length - 1}__`
  })

  const linkClass = isUser
    ? 'text-white underline underline-offset-2 hover:opacity-80 break-all'
    : 'text-brand-primary font-medium underline underline-offset-2 hover:opacity-80 break-all'

  const links: string[] = []

  // Markdown links: [text](url)
  html = html.replace(/\[([^\]]+)\]\((https?:\/\/[^\s<)]+)\)/g, (_, text, url) => {
    links.push(
      `<a href="${url}" target="_blank" rel="noopener noreferrer" class="${linkClass}">${text}</a>`,
    )
    return `__LINK_${links.length - 1}__`
  })

  // Emails
  html = html.replace(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi, (_, email) => {
    links.push(`<a href="mailto:${email}" class="${linkClass}">${email}</a>`)
    return `__LINK_${links.length - 1}__`
  })

  // Raw URLs
  html = html.replace(/(https?:\/\/[^\s<]+)/g, (_, url) => {
    links.push(
      `<a href="${url}" target="_blank" rel="noopener noreferrer" class="${linkClass}">${url}</a>`,
    )
    return `__LINK_${links.length - 1}__`
  })

  html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>')
  html = html.replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')

  const lines = html.split('\n')
  let inUl = false
  let inOl = false
  const result: string[] = []
  let currentParagraph: string[] = []

  const flushParagraph = () => {
    if (currentParagraph.length > 0) {
      result.push(`<p class="mb-3 last:mb-0 leading-relaxed">${currentParagraph.join('<br/>')}</p>`)
      currentParagraph = []
    }
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trimEnd()

    if (line === '') {
      flushParagraph()
      if (inUl) {
        result.push('</ul>')
        inUl = false
      }
      if (inOl) {
        result.push('</ol>')
        inOl = false
      }
      continue
    }

    if (line.match(/^__CODE_BLOCK_\d+__$/)) {
      flushParagraph()
      if (inUl) {
        result.push('</ul>')
        inUl = false
      }
      if (inOl) {
        result.push('</ol>')
        inOl = false
      }
      result.push(line)
      continue
    }

    const hMatch = line.match(/^(#{1,6})\s+(.*)/)
    if (hMatch) {
      flushParagraph()
      if (inUl) {
        result.push('</ul>')
        inUl = false
      }
      if (inOl) {
        result.push('</ol>')
        inOl = false
      }
      const level = hMatch[1].length
      const size = level <= 2 ? 'text-base' : 'text-sm'
      const margin = level === 1 ? 'mt-5 mb-3' : 'mt-4 mb-2'
      const colorClass = isUser ? 'text-white' : 'text-brand-textPrimary'
      result.push(
        `<h${level} class="font-semibold ${size} ${margin} ${colorClass}">${hMatch[2]}</h${level}>`,
      )
      continue
    }

    const ulMatch = line.match(/^-\s+(.*)/)
    if (ulMatch) {
      flushParagraph()
      if (inOl) {
        result.push('</ol>')
        inOl = false
      }
      if (!inUl) {
        result.push('<ul class="list-disc pl-5 mb-3 space-y-1 last:mb-0">')
        inUl = true
      }
      result.push(`<li>${ulMatch[1]}</li>`)
      continue
    }

    const olMatch = line.match(/^\d+\.\s+(.*)/)
    if (olMatch) {
      flushParagraph()
      if (inUl) {
        result.push('</ul>')
        inUl = false
      }
      if (!inOl) {
        result.push('<ol class="list-decimal pl-5 mb-3 space-y-1 last:mb-0">')
        inOl = true
      }
      result.push(`<li>${olMatch[1]}</li>`)
      continue
    }

    if (inUl || inOl) {
      if (inUl) {
        result.push('</ul>')
        inUl = false
      }
      if (inOl) {
        result.push('</ol>')
        inOl = false
      }
    }

    currentParagraph.push(line)
  }

  flushParagraph()
  if (inUl) result.push('</ul>')
  if (inOl) result.push('</ol>')

  let finalHtml = result.join('\n')

  finalHtml = finalHtml.replace(/__LINK_(\d+)__/g, (_, index) => {
    return links[parseInt(index, 10)]
  })
  finalHtml = finalHtml.replace(/__INLINE_CODE_(\d+)__/g, (_, index) => {
    return inlineCodes[parseInt(index, 10)]
  })
  finalHtml = finalHtml.replace(/__CODE_BLOCK_(\d+)__/g, (_, index) => {
    return codeBlocks[parseInt(index, 10)]
  })

  return finalHtml
}

function MessageContent({ content, isUser }: { content: string; isUser: boolean }) {
  if (!content) return null

  const html = formatMarkdown(content, isUser)

  return <div className="text-sm" dangerouslySetInnerHTML={{ __html: html }} />
}
