# node-bitcoinaverage-api
This repository is a **hard-fork** of [BitcoinAverage NodeJS Client](https://www.npmjs.com/package/bitcoinaverage).

Ideally, it would be a **git-fork**, but the repository for the client isn't visible.

This repository was built in order to be hardened for server deployment.
There are two big changes:
first,
`getResourceForFullUrl` invokes the callback with an `err` parameter;
and,
second,
events for `WebsocketClient` are non-ambiguous.

Enjoy!

## Example
If the `dependencies` field in `package.json` includes:

    "node-bitcoinaverage-api": "brave-intl/node-bitcoinaverage-api",

Then this shows how to do both a restful call (`symbolsGlobal`) and make use of websockets (`connectToTickerWebsocket`):

    const bitcoinaverage = require('node-bitcoinaverage-api')
    
    const altcoins = [ 'BTC' ]
    const fiats = [ 'USD', 'EUR', 'GBP' ]
    
    const eligible = []
    altcoins.forEach((alt) => {
      fiats.forEach((fiat) => {
        eligible.push(alt + fiat)
      })
    })
    
    const publicKey = '...'
    const secretKey = '...'
    
    const c2s = {
      1000: 10,     /* normal */
      1001: 60,     /* going away */
      1011: 60,     /* unexpected condition */
      1012: 60,     /* service restart */
      1013: 300     /* try again later */
    }
    
    bitcoinaverage.restfulClient(publicKey, secretKey).symbolsGlobal((err, result) => {
      if (err) return console.error(err)
    
      const symbols = JSON.parse(result).symbols
    
      const pairing = (symbol) => {
        console.log('pairing ' + symbol)
    
        bitcoinaverage.websocketClient(publicKey, secretKey).connectToTickerWebsocket('global', symbol, (tag, type, data) => {
          const f = {
            open: () => {
              if (data.operation === 'subscribe') return console.log(tag + ': subscribed')
    
              console.log('unexpected open event ' + tag + ': ' + JSON.stringify(data, null, 2))
            },
    
            message: () => {
              if (data.event === 'message') return console.log(tag + ': last=' + data.data.last)
    
              console.log('unexpected message event ' + tag + ': ' + JSON.stringify(data, null, 2))
            },
    
            error: () => {
              console.log(tag + ': error code=' + data.code + ' reason=' + data.reason)
              setTimeout(() => { pairing(symbol) }, (c2s[data.code] || 600) * 1000)
            },
    
            close: () => {
              console.log('close: ' + tag + ': ' + JSON.stringify(data))
              setTimeout(() => { pairing(symbol) }, (c2s[data.code] || 600) * 1000 / (data.wasClean ? 2 : 1))
            },
    
            internal: () => {
              if ((data.type === 'status') && (data.data === 'OK')) return console.log(tag + ': ready')
    
              console.log('unexpected internal event ' + tag + ': ' + JSON.stringify(data, null, 2))
            }
          }[type]
          if (f) return f()
    
          console.log('unexpected ' + type + ' event ' + tag + ' data=' + JSON.stringify(data, null, 2))
        })
      }
    
      symbols.forEach((symbol) => { if (eligible.indexOf(symbol) !== -1) pairing(symbol) })
    })
