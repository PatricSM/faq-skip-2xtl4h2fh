/// <reference path="../pb_data/types.d.ts" />
migrate(
  (app) => {
    $ai.agents.define(app, {
      slug: 'skip-support',
      name: 'Suporte Skip',
      description: 'Assistente de suporte FAQ Skip.',
      systemPrompt:
        'Você é o assistente de suporte do Skip. Responda de forma prestativa usando apenas a base de perguntas frequentes e as categorias fornecidas. Se a pergunta não estiver na base, sugira entrar em contato pelo e-mail duvidas@adapta.org.',
      tier: 'fast',
      tools: [
        { collection: 'questions', perms: { list: true, read: true } },
        { collection: 'categories', perms: { list: true, read: true } },
      ],
      memory: [],
    })
  },
  (app) => {
    $ai.agents.delete(app, 'skip-support')
  },
)
