const config = require('../config')
const WS = require('ws')
const restfulClient = require('./restful-client')

module.exports = {
  WebsocketClient: function (publicKey, secretKey) {
    const connect = (url, tag, options, cb) => {
      restfulClient.RestfulClient(publicKey, secretKey).getTicket((err, result) => {
        let code

        if (err) {
          code = (err.response && err.response.statusCode === 400) ? 1008 : 1011

          return cb(tag, 'error', { code: code, reason: err.toString() })
        }

        const ticket = JSON.parse(result).ticket
        let websocket = new WS(url + '?public_key=' + publicKey + '&ticket=' + ticket)

        websocket.onopen = () => {
          const message = { event: 'message', data: { operation: 'subscribe', options: options } }

          websocket.send(JSON.stringify(message), (err) => {
            let code = 1006

            if (err) return cb(tag, 'error', { code: code, reason: err.toString() })

            cb(tag, 'open', message.data)
          })
        }

        websocket.onmessage = (message) => {
          const data = JSON.parse(message.data)

          cb(tag, data.event ? message.type : 'internal', data)
        }

        websocket.onerror = (err, code) => {
          cb(tag, 'error', { code: code, reason: err.toString() })
        }

        websocket.onclose = (message) => {
          cb(tag, 'close', { wasClean: message.wasClean, code: message.code, reason: message.reason })
        }

        websocket.onping = (data) => {
          console.log('*** ping: ' + JSON.stringify(data, null, 2))
          cb(tag, data)
        }

        websocket.onpong = (data) => {
          console.log('*** pong: ' + JSON.stringify(data, null, 2))
          cb(tag, data)
        }
      })
    }

    this.connectToTickerWebsocket = (market, symbol, cb) => {
      connect(config.WEBSOCKET_PREFIX + 'ticker', symbol + '/' + market, { currency: symbol, market: market }, cb)
    }

    this.connectToExchangeWebsocket = (exchangeName, cb) => {
      connect(config.WEBSOCKET_PREFIX + 'exchanges', exchangeName, { exchange: exchangeName }, cb)
    }

    return this
  }
}
