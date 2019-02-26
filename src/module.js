module.exports = {
  Instance: require('./Instance'),
  Protocols: {
    Http: require('./protocols/Http'),
    WebSockets: require('./protocols/WebSockets')
  },
  Ddbms: {
    Ipfs: require('./ddbms/Ipfs')
  }
}
