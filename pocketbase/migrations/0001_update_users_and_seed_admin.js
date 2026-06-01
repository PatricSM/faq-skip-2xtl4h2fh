migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('_pb_users_auth_')

    if (!users.fields.getByName('role')) {
      users.fields.add(
        new SelectField({ name: 'role', values: ['admin', 'superadmin'], maxSelect: 1 }),
      )
    }
    if (!users.fields.getByName('isActive')) {
      users.fields.add(new BoolField({ name: 'isActive' }))
    }
    app.save(users)

    try {
      const record = app.findAuthRecordByEmail('_pb_users_auth_', 'admin@goskip.dev')
      record.set('role', 'superadmin')
      record.set('isActive', true)
      app.save(record)
    } catch (_) {
      const record = new Record(users)
      record.setEmail('admin@goskip.dev')
      record.setPassword('FaqSkip@2026Admin')
      record.set('name', 'Admin Master')
      record.set('role', 'superadmin')
      record.set('isActive', true)
      record.setVerified(true)
      record.set('emailVisibility', true)
      app.save(record)
    }
  },
  (app) => {
    try {
      const record = app.findAuthRecordByEmail('_pb_users_auth_', 'admin@goskip.dev')
      app.delete(record)
    } catch (_) {}

    const users = app.findCollectionByNameOrId('_pb_users_auth_')
    if (users.fields.getByName('role')) {
      users.fields.removeByName('role')
    }
    if (users.fields.getByName('isActive')) {
      users.fields.removeByName('isActive')
    }
    app.save(users)
  },
)
