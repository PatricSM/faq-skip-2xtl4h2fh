migrate(
  (app) => {
    const dropsCol = app.findCollectionByNameOrId('drops')

    const dropsData = [
      {
        video_id: '1lomuLITGs1ndxpYydUx7cd1agpuprBj2',
        title: 'Como resolver erros de cache',
        slug: 'resolver-erros-de-cache',
        description: 'Como limpar o cache do navegador...',
        category_slug: 'acesso',
        order: 1,
      },
      {
        video_id: '1rA83lmfNHk7OhaT9HQVTciUJEPNr4Zvm',
        title: 'Como voltar à versão do projeto',
        slug: 'voltar-a-versao-do-projeto',
        description: 'Diferença entre Restaurar e Reverter...',
        category_slug: 'bug-builder',
        order: 2,
      },
      {
        video_id: '11yjV8xg20UwzPzOBiY78wRag2AfOOIei',
        title: 'Publicar sua aplicação',
        slug: 'publicar-sua-aplicacao',
        description: 'Passo a passo para publicar seu app...',
        category_slug: 'publicacao',
        order: 3,
      },
      {
        video_id: '1izwKrNEC-Cl9mKOq5ud19KQLHAwABaoF',
        title: 'Conectar dados reais ao app',
        slug: 'conectar-dados-reais',
        description: 'Como substituir dados mockados por reais...',
        category_slug: 'bug-builder',
        order: 4,
      },
      {
        video_id: '1tY_wrqCLVM3LmqWtY09bVUjG7Xo46Wep',
        title: 'Como verificar o saldo de créditos',
        slug: 'verificar-saldo-creditos',
        description: 'Acompanhar saldo e consumo em tempo real...',
        category_slug: 'creditos',
        order: 5,
      },
      {
        video_id: '1RW42CjAB-Sak86OUMgjOxzW0q6S3l1W9',
        title: 'Mudar senha ou criar usuários',
        slug: 'usuarios-e-senha-skip-cloud',
        description: 'Gerenciamento de contas e senhas...',
        category_slug: 'publicacao',
        order: 6,
      },
      {
        video_id: '1t7PmuIp33lC3tEVyMWW2TnnmuvCDYXQD',
        title: 'Guia de engenharia de prompt',
        slug: 'engenharia-de-prompt',
        description: 'Como escrever prompts diretos e específicos...',
        category_slug: 'onboarding',
        order: 7,
      },
      {
        video_id: '18mSd9bNRKZ-C_p2V0OCHlEcXA-hBpnot',
        title: 'Como duplicar um projeto',
        slug: 'duplicar-projeto',
        description: 'Criar cópia de projeto via Configurações...',
        category_slug: 'skip-builder',
        order: 8,
      },
      {
        video_id: '15SxrzF5LTxRq1LAK1GrHonJCD_4RQgX7',
        title: 'Como ver a versão mobile',
        slug: 'ver-versao-mobile',
        description: 'Alternar preview entre desktop e mobile...',
        category_slug: 'bug-builder',
        order: 9,
      },
      {
        video_id: '1aRgEgHTQJiuj9ag-_rpXXwpDLBPvVZX2',
        title: 'Modos do Chat: Agent, Build e Chat',
        slug: 'modos-chat-build-agent',
        description: 'Diferenças entre os modos de interação...',
        category_slug: 'skip-builder',
        order: 10,
      },
      {
        video_id: '1CdCINiqCa3JKyZcaFWU81y3QQMuvNpP3',
        title: 'Como alterar o nome do projeto',
        slug: 'nome-projeto-compartilhar',
        description: 'Configurar título e ícone (Favicon/OG)...',
        category_slug: 'skip-builder',
        order: 11,
      },
      {
        video_id: '1AEqYrZhYZFgvTVkm6Xo8gGjdR9BUMMur',
        title: 'Como esconder o selo do Skip',
        slug: 'esconder-selo-skip',
        description: 'Remover badge "criado com o Skip"...',
        category_slug: 'marca-branca',
        order: 12,
      },
    ]

    for (const d of dropsData) {
      try {
        app.findFirstRecordByData('drops', 'video_id', d.video_id)
        continue
      } catch (_) {}

      let categoryId = null
      try {
        const cat = app.findFirstRecordByData('categories', 'slug', d.category_slug)
        categoryId = cat.id
      } catch (_) {}

      const record = new Record(dropsCol)
      record.set('title', d.title)
      record.set('slug', d.slug)
      record.set('description', d.description)
      record.set('video_url', `https://drive.google.com/file/d/${d.video_id}/view`)
      record.set('video_id', d.video_id)
      if (categoryId) record.set('category', categoryId)
      record.set('order', d.order)
      record.set('is_published', true)
      record.set('views', 0)
      app.save(record)
    }
  },
  (app) => {
    // Down migration
  },
)
