migrate(
  (app) => {
    const qdCol = app.findCollectionByNameOrId('question_drops')

    const links = [
      {
        video_id: '1lomuLITGs1ndxpYydUx7cd1agpuprBj2',
        questions: [
          'Não estou conseguindo acessar a plataforma',
          'Estou com problemas para fazer login no Skip',
          'O Skip está fora do ar',
          'A tela do Skip fica totalmente preta ao acessar',
        ],
      },
      {
        video_id: '1rA83lmfNHk7OhaT9HQVTciUJEPNr4Zvm',
        questions: [
          'Aparece versão ativa desatualizada',
          'O Skip não está salvando minhas alterações',
          'Não consigo reverter para uma versão anterior',
        ],
      },
      {
        video_id: '11yjV8xg20UwzPzOBiY78wRag2AfOOIei',
        questions: [
          'Meu site publicado retorna App não publicado',
          'Como publico / coloco no ar o meu app',
        ],
      },
      {
        video_id: '1izwKrNEC-Cl9mKOq5ud19KQLHAwABaoF',
        questions: ['O app está usando dados mockados em vez dos dados reais'],
      },
      {
        video_id: '1tY_wrqCLVM3LmqWtY09bVUjG7Xo46Wep',
        questions: ['Onde acompanho meu saldo de créditos'],
      },
      {
        video_id: '1RW42CjAB-Sak86OUMgjOxzW0q6S3l1W9',
        questions: ['Como compartilho o app publicado com minha equipe'],
      },
      {
        video_id: '1t7PmuIp33lC3tEVyMWW2TnnmuvCDYXQD',
        questions: ['Quais os primeiros passos / onboarding'],
      },
      {
        video_id: '1CdCINiqCa3JKyZcaFWU81y3QQMuvNpP3',
        questions: ['Como subo meu logo / favicon'],
      },
      {
        video_id: '1AEqYrZhYZFgvTVkm6Xo8gGjdR9BUMMur',
        questions: ['Como removo o badge Skip do meu app'],
      },
    ]

    for (const link of links) {
      let drop
      try {
        drop = app.findFirstRecordByData('drops', 'video_id', link.video_id)
      } catch (_) {
        continue
      }

      for (const qText of link.questions) {
        let question
        try {
          const records = app.findRecordsByFilter(
            'questions',
            `question ~ "${qText}"`,
            '-created',
            1,
            0,
          )
          if (records && records.length > 0) {
            question = records[0]
          }
        } catch (err) {}

        if (question) {
          try {
            const exists = app.findRecordsByFilter(
              'question_drops',
              `question = "${question.id}" && drop = "${drop.id}"`,
              '-created',
              1,
              0,
            )
            if (!exists || exists.length === 0) {
              const qdRecord = new Record(qdCol)
              qdRecord.set('question', question.id)
              qdRecord.set('drop', drop.id)
              qdRecord.set('order', 1)
              app.save(qdRecord)
            }
          } catch (_) {}
        }
      }
    }
  },
  (app) => {
    // Down migration
  },
)
