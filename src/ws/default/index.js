// learn more about WebSocket functions here: https://arc.codes/primitives/ws
const arc = require('@architect/functions')

exports.handler = async function ws(event) {
  console.log(event)
  await arc.ws.send({
    //who to send it to
    id: event.requestContext.connectionId,
    //what we're sending
    payload: {
      praise: 'cage',
      id: event.requestContext.connectionId
    }
  })
  
  return {statusCode: 200}
}