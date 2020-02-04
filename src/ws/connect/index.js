// learn more about WebSocket functions here: https://arc.codes/primitives/ws
const arc = require('@architect/functions')

exports.handler = async function ws(req) {
  let { requestContext } = req

  console.log(`Worshiper ${requestContext.connectionId} has connected`)

  const params = { connectionId: requestContext.connectionId }
  let data = await arc.tables()
  
  //put connectionId into connection_table as a new row
  try {
    await data.connection_table.put(params)
    console.log('added to db')
    //AWS WebSocket $connect route must return 200 to establish handshake and keep socket open
    return {statusCode: 200}
  }
  catch(err) {
    console.log(err)
    return {statusCode: 200}
  } 
}