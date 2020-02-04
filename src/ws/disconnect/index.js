// learn more about WebSocket functions here: https://arc.codes/primitives/ws
const arc = require('@architect/functions')

exports.handler = async function ws(req) {
  // connectionId of calling socket connection that should be removed
  let connectionId = req.requestContext.connectionId
  console.log(`Worshiper ${connectionId} has disconnected`)

  // delete connectionId from connection_table
  const params = { connectionId: connectionId }
  let data = await arc.tables()
  try {
    await data.connection_table.delete(params)
    console.log('deleted from db')
  }
  catch(err) {
    console.log(err)
  }

  let clients = await data.connection_table.scan({})
  console.log(clients)
  
  console.log('end of $disconnect')
  return {statusCode: 200}
}