// learn more about WebSocket functions here: https://arc.codes/primitives/ws
const arc = require('@architect/functions')

exports.handler = async function ws(event) {
  const connectionId = event.requestContect.connectionId
  const message = JSON.parse(event.body)
  const action = JSON.parse(event.body).action

  if (action === 'connected') {
    let id = connectionId
    let payload = {
      action: 'connected'
    }
    return arc.ws(event).send({
      id: id,
      payload: payload
    })
  }
}