// learn more about WebSocket functions here: https://arc.codes/primitives/ws
// adding dependencies to a functinon involves creating package.json at the function level
const arc = require('@architect/functions')

// main event bus for websocket message events
exports.handler = async function ws(req) {

  // the connectionId of calling socket connection
  const connectionId = req.requestContext.connectionId;
  console.log(connectionId)

  // read dynamo for all connectionIds
  let data = await arc.tables()
  const scan = await data.connection_table.scan({})
  console.log(`scan shows ${scan.Count} from default`)

  // action handlers with specific "channels"
  const action = JSON.parse(req.body).action

  //map connectionIds and send all Ids to connected clients
  if (action === 'connected') {
    console.log('$default:connected called')
    let clients = scan.Items
    //all connected clients
    console.log(clients)

    arc.ws.send({
      id: connectionId,
      payload: {
        clients: clients,
        id: connectionId
      }
    })
    console.log('end of $default:connected')
    return {statusCode: 200}
  }

  console.log('end of $default')
  return {statusCode: 200}
}