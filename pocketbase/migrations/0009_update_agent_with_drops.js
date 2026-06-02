/// <reference path="../pb_data/types.d.ts" />
migrate(
  (app) => {
    const systemPrompt =
      "Você é o Assistente de Suporte FAQ Skip — atende em primeiro nível usando apenas a base de perguntas e respostas oficiais do Skip.\nResponda usando APENAS a base de dados de FAQ (questions, categories). Se a pergunta for sobre um assunto não encontrado na base, oriente o usuário a enviar um e-mail para duvidas@adapta.org com contexto suficiente (prints, e-mail de login, projeto).\nSe a pergunta correspondente possuir um vídeo associado em question_drops, sugira o vídeo AO FINAL da resposta usando EXATAMENTE este formato: '📺 Veja também o vídeo: [TÍTULO DO DROP](/drops/SLUG_DO_DROP)'. Utilize o slug do drop para formar a URL interna. Sugira no máximo 2 vídeos por resposta."

    const tools = [
      { collection: 'questions', perms: { list: true, read: true } },
      { collection: 'categories', perms: { list: true, read: true } },
      { collection: 'drops', perms: { list: true, read: true } },
      { collection: 'question_drops', perms: { list: true, read: true } },
    ]

    // Definition for "skip-support"
    $ai.agents.define(app, {
      slug: 'skip-support',
      name: 'Suporte Skip',
      description: 'Assistente de suporte FAQ Skip.',
      systemPrompt,
      tier: 'fast',
      tools,
    })

    // Definition for "suporte-skip" as well to match current usage inside the hook
    $ai.agents.define(app, {
      slug: 'suporte-skip',
      name: 'Suporte Skip',
      description: 'Assistente de suporte FAQ Skip.',
      systemPrompt,
      tier: 'fast',
      tools,
    })
  },
  (app) => {
    // Down migration
  },
)
