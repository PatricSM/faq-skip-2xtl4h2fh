onRecordDeleteRequest((e) => {
  const col = e.collection.name
  if (!['users', 'categories', 'questions'].includes(col)) {
    return e.next()
  }

  e.next()

  const log = new Record($app.findCollectionByNameOrId('activity_logs'))
  if (e.auth) log.set('user', e.auth.id)

  log.set('action', 'deleted')
  log.set('entity', col)
  log.set('entity_id', e.record.id)

  let details = {}
  if (col === 'users') {
    details = { email: e.record.getString('email'), name: e.record.getString('name') }
  } else if (col === 'categories') {
    details = { label: e.record.getString('label') }
  } else if (col === 'questions') {
    details = { question: e.record.getString('question') }
  }

  log.set('details', details)
  $app.saveNoValidate(log)
})
