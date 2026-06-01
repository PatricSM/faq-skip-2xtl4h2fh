migrate(
  (app) => {
    const categories = new Collection({
      name: 'categories',
      type: 'base',
      listRule: '',
      viewRule: '',
      createRule: "@request.auth.role = 'admin' || @request.auth.role = 'superadmin'",
      updateRule: "@request.auth.role = 'admin' || @request.auth.role = 'superadmin'",
      deleteRule: "@request.auth.role = 'superadmin'",
      fields: [
        { name: 'slug', type: 'text', required: true, max: 80 },
        { name: 'label', type: 'text', required: true, max: 120 },
        { name: 'order', type: 'number' },
        { name: 'icon', type: 'text', max: 50 },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: ['CREATE UNIQUE INDEX idx_categories_slug ON categories (slug)'],
    })
    app.save(categories)

    const questions = new Collection({
      name: 'questions',
      type: 'base',
      listRule:
        "status = 'published' || @request.auth.role = 'admin' || @request.auth.role = 'superadmin'",
      viewRule:
        "status = 'published' || @request.auth.role = 'admin' || @request.auth.role = 'superadmin'",
      createRule: "@request.auth.role = 'admin' || @request.auth.role = 'superadmin'",
      updateRule: "@request.auth.role = 'admin' || @request.auth.role = 'superadmin'",
      deleteRule: "@request.auth.role = 'admin' || @request.auth.role = 'superadmin'",
      fields: [
        {
          name: 'category',
          type: 'relation',
          required: true,
          collectionId: categories.id,
          maxSelect: 1,
        },
        { name: 'question', type: 'text', required: true, max: 500 },
        { name: 'answer', type: 'editor', required: true },
        {
          name: 'status',
          type: 'select',
          required: true,
          values: ['published', 'draft'],
          maxSelect: 1,
        },
        { name: 'order', type: 'number' },
        { name: 'priority', type: 'select', values: ['Alta', 'Média', 'Baixa'], maxSelect: 1 },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE INDEX idx_questions_category ON questions (category)',
        'CREATE INDEX idx_questions_status ON questions (status)',
      ],
    })
    app.save(questions)

    const activity_logs = new Collection({
      name: 'activity_logs',
      type: 'base',
      listRule: "@request.auth.role = 'admin' || @request.auth.role = 'superadmin'",
      viewRule: "@request.auth.role = 'admin' || @request.auth.role = 'superadmin'",
      createRule: null,
      updateRule: null,
      deleteRule: null,
      fields: [
        { name: 'user', type: 'relation', collectionId: '_pb_users_auth_', maxSelect: 1 },
        {
          name: 'action',
          type: 'select',
          required: true,
          values: ['created', 'updated', 'deleted', 'published', 'unpublished'],
          maxSelect: 1,
        },
        { name: 'entity', type: 'text', required: true },
        { name: 'entity_id', type: 'text' },
        { name: 'details', type: 'json' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(activity_logs)
  },
  (app) => {
    try {
      app.delete(app.findCollectionByNameOrId('activity_logs'))
    } catch (_) {}
    try {
      app.delete(app.findCollectionByNameOrId('questions'))
    } catch (_) {}
    try {
      app.delete(app.findCollectionByNameOrId('categories'))
    } catch (_) {}
  },
)
