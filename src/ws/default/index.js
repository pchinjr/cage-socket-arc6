// learn more about WebSocket functions here: https://arc.codes/primitives/ws
// adding dependencies to a functinon involves creating package.json at the function level
const arc = require('@architect/functions')

exports.handler = async function ws(event) {
  
  
  
  await arc.ws.send({
    //who to send it to
    id: event.requestContext.connectionId,
    //what we're sending
    payload: {
      praise: 'cage',
      id: event.requestContext.connectionId
    }
  })
  console.log('invoking default')
  return {statusCode: 200}
}