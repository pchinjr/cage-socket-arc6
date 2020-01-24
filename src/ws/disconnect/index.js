// learn more about WebSocket functions here: https://arc.codes/primitives/ws
const arc = require('@architect/functions')

exports.handler = async function ws (req) {
  console.log('Worshiper has disconnected')
  let { requestContext } = req
  const connectionId = requestContext.connectionId
  const params = { connectionId: connectionId}
  await arc.data.connection_table.delete(params)
  return {statusCode: 200}
}