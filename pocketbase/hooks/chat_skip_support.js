routerAdd('POST', '/backend/v1/chat_skip_support', (e) => {
  try {
    const body = e.requestInfo().body || {}
    const userId = e.auth?.id

    if (!body.session_id && !userId) return e.badRequestError('session_id is required')
    if (!body.message?.trim()) return e.badRequestError('message is required')

    if (userId) {
      const conv = $ai.agent('suporte-skip').getOrCreateConversation({
        user_id: userId,
        id: body.conversation_id || null,
      })

      const iter = $ai.agent('suporte-skip').chat({
        user_id: userId,
        conversation_id: conv.id,
        message: body.message,
        stream: true,
      })

      e.response.header().set('Content-Type', 'text/event-stream')
      e.response.header().set('Cache-Control', 'no-cache')
      e.response.header().set('X-Conversation-Id', conv.id)
      return $response.stream(e, iter)
    } else {
      const searchRes = $ai.agent('suporte-skip').searchMemory({
        query: body.message,
        k: 6,
      })

      let contextText = ''
      if (searchRes && searchRes.items) {
        contextText = searchRes.items.map((item, i) => `[${i + 1}] ${item.text}`).join('\n\n')
      }

      const systemPrompt = `Você é o Assistente de Suporte FAQ Skip — atende em primeiro nível usando apenas a base de perguntas e respostas oficiais do Skip. Resolve dúvidas comuns, identifica quando precisa escalar, e direciona casos não cobertos ou frustrações para o e-mail de suporte humano (duvidas@adapta.org), sempre orientando o usuário a enviar contexto suficiente (prints, e-mail de login, projeto). Cite as fontes no formato [n] se aplicável.\n\nContexto:\n${contextText}`

      const messages = [{ role: 'system', content: systemPrompt }]

      if (Array.isArray(body.history)) {
        for (const msg of body.history) {
          if (msg.role && msg.content && msg.role !== 'system') {
            messages.push({ role: msg.role, content: msg.content })
          }
        }
      }

      messages.push({ role: 'user', content: body.message })

      const iter = $ai.chat({
        model: 'fast',
        messages: messages,
        stream: true,
      })

      e.response.header().set('Content-Type', 'text/event-stream')
      e.response.header().set('Cache-Control', 'no-cache')
      e.response.header().set('X-Conversation-Id', body.session_id || 'anon')
      return $response.stream(e, iter)
    }
  } catch (err) {
    if (err instanceof SkipAiConfigError)
      return e.json(503, { error: 'AI temporarily unavailable' })
    if (err instanceof SkipAiAgentsError) {
      const status = err.status || 500
      return e.json(status, { error: status >= 500 ? 'agent request failed' : err.message })
    }
    if (err instanceof SkipAiError) {
      const status = err.status || 502
      return e.json(status, { error: status >= 500 ? 'AI temporarily unavailable' : err.message })
    }
    throw err
  }
})
