// learn more about WebSocket functions here: https://arc.codes/primitives/ws
exports.handler = async function ws(req) {
  let { requestContext } = req
  console.log(requestContext.connectionId)
  return {statusCode: 200}
}