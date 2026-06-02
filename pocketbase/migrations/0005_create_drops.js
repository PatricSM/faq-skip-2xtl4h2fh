migrate(
  (app) => {
    const collection = new Collection({
      name: 'drops',
      type: 'base',
      listRule:
        "is_published = true || @request.auth.role = 'admin' || @request.auth.role = 'superadmin'",
      viewRule:
        "is_published = true || @request.auth.role = 'admin' || @request.auth.role = 'superadmin'",
      createRule: "@request.auth.role = 'admin' || @request.auth.role = 'superadmin'",
      updateRule: "@request.auth.role = 'admin' || @request.auth.role = 'superadmin'",
      deleteRule: "@request.auth.role = 'admin' || @request.auth.role = 'superadmin'",
      fields: [
        { name: 'title', type: 'text', required: true, max: 200 },
        { name: 'slug', type: 'text', required: true, max: 80 },
        { name: 'description', type: 'text', max: 1000 },
        { name: 'video_url', type: 'url', required: true },
        { name: 'video_id', type: 'text', required: true, max: 100 },
        {
          name: 'category',
          type: 'relation',
          collectionId: app.findCollectionByNameOrId('categories').id,
          maxSelect: 1,
        },
        { name: 'duration_seconds', type: 'number', min: 0 },
        { name: 'thumbnail_url', type: 'url' },
        { name: 'order', type: 'number' },
        { name: 'is_published', type: 'bool' },
        { name: 'views', type: 'number', min: 0 },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE UNIQUE INDEX idx_drops_slug ON drops (slug)',
        'CREATE UNIQUE INDEX idx_drops_video_id ON drops (video_id)',
        'CREATE INDEX idx_drops_category ON drops (category)',
        'CREATE INDEX idx_drops_order ON drops (`order`)',
        'CREATE INDEX idx_drops_is_published ON drops (is_published)',
      ],
    })
    app.save(collection)
  },
  (app) => {
    const collection = app.findCollectionByNameOrId('drops')
    app.delete(collection)
  },
)
