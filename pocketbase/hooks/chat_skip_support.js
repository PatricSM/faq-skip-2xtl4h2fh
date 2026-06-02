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

      const systemPrompt = `Você é o Assistente de Suporte FAQ Skip — atende em primeiro nível usando apenas a base de perguntas e respostas oficiais do Skip.
Responda usando APENAS a base de dados de FAQ (questions, categories). Se a pergunta for sobre um assunto não encontrado na base, oriente o usuário a enviar um e-mail para duvidas@adapta.org com contexto suficiente (prints, e-mail de login, projeto).
Se a pergunta correspondente possuir um vídeo associado em question_drops, sugira o vídeo AO FINAL da resposta usando EXATAMENTE este formato: '📺 Veja também o vídeo: [TÍTULO DO DROP](/drops/SLUG_DO_DROP)'. Utilize o slug do drop para formar a URL interna. Sugira no máximo 2 vídeos por resposta.
Cite as fontes no formato [n] se aplicável.

Contexto:
${contextText}`

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
