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

## The original README file
BitcoinAverage NodeJS Client
============================

This client enables quick and easy access to our Bitcoin, Ethereum, Litecoin, Ripple and other cryptocurrency exchange rates.


To install the library, you just need to run the following command:


```
#!node

npm install bitcoinaverage
```


Here we provide you 2 examples - the first example shows how to call function which makes a HTTP request to our Restful [API](https://apiv2.bitcoinaverage.com/) and the other example connects to one of our websockets. You just need to enter your publicKey and secretKey and you are ready to run this example.



```
#!node

const ba = require('bitcoinaverage');

var publicKey = 'yourPublicKey';
var secretKey = 'yourSecretKey';

var restClient = ba.restfulClient(publicKey, secretKey);
var wsClient = ba.websocketClient(publicKey, secretKey);


// Here we log the response received by https://apiv2.bitcoinaverage.com/indices/global/ticker/BTCUSD. For custom usage you just need to implement the Anonimous function and do something else instead of console.log(response);.
restClient.tickerGlobalPerSymbol('BTCUSD', function(response) {
    console.log(response);
});


// Here we show an example how to connect to one of our websockets and get periodical update for the Global Price Index for 'BTCUSD'. You can use 'local' instead of 'global', or you can change the crypto-fiat pair to something else (example: ETHEUR), depending on your needs.
wsClient.connectToTickerWebsocket('global', 'BTCUSD', function(response) {
    console.log(response);
});
```
