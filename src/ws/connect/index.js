// learn more about WebSocket functions here: https://arc.codes/primitives/ws
const arc = require('@architect/functions')

exports.handler = async function ws(req) {
  let { requestContext } = req
  console.log(`Worshiper: ${requestContext.connectionId} has connected`)
  const connectionId = requestContext.connectionId
  const params = { connectionId: connectionId }
  let data = await arc.tables()
  await data.connection_table.put(params)
  return {statusCode: 200}
}