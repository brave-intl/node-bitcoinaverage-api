'use strict'

const crypto = require('crypto-js')
const request = require('request')

module.exports = {
  getSignature: getSignature,
  getResourceForFullUrl: getResourceForFullUrl
}

function getSignature (publicKey, secretKey) {
  var timestamp = Math.floor(Date.now() / 1000)
  var payload = timestamp + '.' + publicKey
  var hash = crypto.HmacSHA256(payload, secretKey)
  var hexHash = crypto.enc.Hex.stringify(hash)
  return payload + '.' + hexHash
}

function getResourceForFullUrl (url, publicKey, secretKey, handleResponseFunction) {
  var signature = getSignature(publicKey, secretKey)
  var options = {
    url: url,
    headers: {
      'X-Signature': signature
    }
  }

  request(options, function (err, response, body) {
    if ((!err) && (response.statusCode === 200)) return handleResponseFunction(null, body)

    if (!err) err = new Error(response.statusCode + ': ' + response.body)
    err.response = response
    handleResponseFunction(err)
  })
}
