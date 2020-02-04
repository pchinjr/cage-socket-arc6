let aws = require('aws-sdk')
let test = require('tape')
let arc = require('@architect/functions')
let sandbox = require('@architect/sandbox')
let end 

test('start', async t => {
  t.plan(1)
  end = await sandbox.start()
  t.ok(true, 'start')
})

test('read', async t=> {
  t.plan(1)
  let db = new aws.DynamoDB({endpoint: 'http://localhost:5000'})
  let tables = await db.listTables({}).promise()
  console.log(tables)
  t.ok(tables, 'db.listTables')
})

test('architect/functions runtime helpers', async t=> {
  t.plan(1)
  let data = await arc.tables()
  let tables = await data.reflect()
  t.ok(data.connection_table, 'data.connection_table')
  console.log(tables)
})

test('end', async t=> {
  t.plan(1)
  end()
  t.ok(true, 'end')
})