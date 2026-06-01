migrate(
  (app) => {
    const categories = [
      { slug: 'acesso', label: 'Acesso', order: 1 },
      { slug: 'skip-cloud', label: 'Skip Cloud', order: 2 },
      { slug: 'creditos', label: 'Créditos', order: 3 },
      { slug: 'bug-builder', label: 'Bugs no Builder', order: 4 },
      { slug: 'skip-builder', label: 'Skip Builder', order: 5 },
      { slug: 'pre-venda', label: 'Pré-Venda', order: 6 },
      { slug: 'upgrade', label: 'Upgrade', order: 7 },
      { slug: 'acesso-login', label: 'Acesso e Login', order: 8 },
      { slug: 'licenciamento', label: 'Licenciamento', order: 9 },
      { slug: 'dominio-customizado', label: 'Domínio Customizado', order: 10 },
      { slug: 'integracao-externa', label: 'Integrações Externas', order: 11 },
      { slug: 'banco-dados', label: 'Banco de Dados', order: 12 },
      { slug: 'publicacao', label: 'Publicação', order: 13 },
      { slug: 'atendimento', label: 'Atendimento', order: 14 },
      { slug: 'plataforma-instabilidade', label: 'Plataforma e Instabilidade', order: 15 },
      { slug: 'desenvolvimento', label: 'Desenvolvimento', order: 16 },
      { slug: 'integracao-whatsapp', label: 'Integração WhatsApp', order: 17 },
      { slug: 'hospedagem', label: 'Hospedagem', order: 18 },
      { slug: 'suporte', label: 'Suporte', order: 19 },
      { slug: 'bug-projetos', label: 'Bugs em Projetos', order: 20 },
      { slug: 'bug-versionamento', label: 'Bugs em Versionamento', order: 21 },
      { slug: 'cancelamento', label: 'Cancelamento', order: 22 },
      { slug: 'exportacao-codigo', label: 'Exportação de Código', order: 23 },
      { slug: 'modelo-negocio', label: 'Modelo de Negócio', order: 24 },
      { slug: 'bug-publicacao', label: 'Bugs em Publicação', order: 25 },
      { slug: 'integracao-pagamento', label: 'Integração de Pagamento', order: 26 },
      { slug: 'marca-branca', label: 'Marca Branca', order: 27 },
      { slug: 'transferencia-projeto', label: 'Transferência de Projeto', order: 28 },
      { slug: 'infra-hospedagem', label: 'Infra/Hospedagem', order: 29 },
      { slug: 'onboarding', label: 'Onboarding', order: 30 },
    ]

    const colCategories = app.findCollectionByNameOrId('categories')
    const categoryIds = {}

    for (const cat of categories) {
      let record
      try {
        record = app.findFirstRecordByData('categories', 'slug', cat.slug)
      } catch (_) {
        record = new Record(colCategories)
      }
      record.set('slug', cat.slug)
      record.set('label', cat.label)
      record.set('order', cat.order)
      app.save(record)
      categoryIds[cat.slug] = record.id
    }

    const questions = [
      {
        question:
          'Não estou conseguindo acessar a plataforma (sem mensagem de erro específica). Como proceder?',
        categorySlug: 'acesso',
        answer:
          'Quando começam "coisas estranhas e inexplicáveis" na plataforma (não conseguir enviar mensagens, alertas de upgrade indevidos, interface desatualizada), recomendamos limpar o cache: botão direito → Inspecionar → clicar e SEGURAR o botão de recarregar → "Esvaziar cache e recarregamento forçado" (ou Ctrl+Shift+R). Verifique também e-mail/senha em Minha Conta → Segurança. Indisponibilidade geral deve ser confirmada com o suporte (canais em Minha Conta → Ajuda).',
        status: 'published',
        priority: 'Alta',
        order: 1,
      },
      {
        question:
          'Como funciona a hospedagem Skip Cloud — onde fica o código e os dados do meu app?',
        categorySlug: 'skip-cloud',
        answer:
          'Ao publicar, o Skip coloca o app em infraestrutura própria (Skip Cloud), sem você contratar servidor. Os dados ficam em um banco dedicado e isolado por projeto, hospedado na AWS — Norte da Virgínia (us-east-1), com criptografia em disco e HTTPS ponta a ponta. Cada projeto tem banco e diretório próprios, sem mistura entre projetos.',
        status: 'published',
        priority: 'Alta',
        order: 2,
      },
    ]

    const colQuestions = app.findCollectionByNameOrId('questions')

    for (const q of questions) {
      let record
      try {
        record = app.findFirstRecordByData('questions', 'question', q.question)
      } catch (_) {
        record = new Record(colQuestions)
      }
      record.set('category', categoryIds[q.categorySlug])
      record.set('question', q.question)
      record.set('answer', q.answer)
      record.set('status', q.status)
      record.set('priority', q.priority)
      record.set('order', q.order)
      app.save(record)
    }
  },
  (app) => {
    const questionsToDelete = [
      'Não estou conseguindo acessar a plataforma (sem mensagem de erro específica). Como proceder?',
      'Como funciona a hospedagem Skip Cloud — onde fica o código e os dados do meu app?',
    ]

    for (const q of questionsToDelete) {
      try {
        const record = app.findFirstRecordByData('questions', 'question', q)
        app.delete(record)
      } catch (_) {}
    }

    const categoriesToDelete = [
      'acesso',
      'skip-cloud',
      'creditos',
      'bug-builder',
      'skip-builder',
      'pre-venda',
      'upgrade',
      'acesso-login',
      'licenciamento',
      'dominio-customizado',
      'integracao-externa',
      'banco-dados',
      'publicacao',
      'atendimento',
      'plataforma-instabilidade',
      'desenvolvimento',
      'integracao-whatsapp',
      'hospedagem',
      'suporte',
      'bug-projetos',
      'bug-versionamento',
      'cancelamento',
      'exportacao-codigo',
      'modelo-negocio',
      'bug-publicacao',
      'integracao-pagamento',
      'marca-branca',
      'transferencia-projeto',
      'infra-hospedagem',
      'onboarding',
    ]

    for (const slug of categoriesToDelete) {
      try {
        const record = app.findFirstRecordByData('categories', 'slug', slug)
        app.delete(record)
      } catch (_) {}
    }
  },
)
