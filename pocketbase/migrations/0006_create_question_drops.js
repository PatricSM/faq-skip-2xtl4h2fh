migrate(
  (app) => {
    const collection = new Collection({
      name: 'question_drops',
      type: 'base',
      listRule: '',
      viewRule: '',
      createRule: "@request.auth.role = 'admin' || @request.auth.role = 'superadmin'",
      updateRule: "@request.auth.role = 'admin' || @request.auth.role = 'superadmin'",
      deleteRule: "@request.auth.role = 'admin' || @request.auth.role = 'superadmin'",
      fields: [
        {
          name: 'question',
          type: 'relation',
          required: true,
          collectionId: app.findCollectionByNameOrId('questions').id,
          cascadeDelete: true,
          maxSelect: 1,
        },
        {
          name: 'drop',
          type: 'relation',
          required: true,
          collectionId: app.findCollectionByNameOrId('drops').id,
          cascadeDelete: true,
          maxSelect: 1,
        },
        { name: 'order', type: 'number' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE INDEX idx_question_drops_question ON question_drops (question)',
        'CREATE INDEX idx_question_drops_drop ON question_drops (drop)',
        'CREATE UNIQUE INDEX idx_question_drops_question_drop ON question_drops (question, drop)',
      ],
    })
    app.save(collection)
  },
  (app) => {
    const collection = app.findCollectionByNameOrId('question_drops')
    app.delete(collection)
  },
)
