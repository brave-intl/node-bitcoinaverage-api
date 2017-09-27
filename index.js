'use strict'

const restfulClient = require('./lib/clients/restful-client')
const websocketClient = require('./lib/clients/websocket-client')

module.exports = {
  restfulClient: restfulClient.RestfulClient,
  websocketClient: websocketClient.WebsocketClient
}
