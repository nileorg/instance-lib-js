class Ipfs {
  constructor (ipfs) {
    this.ipfs = ipfs
    this.ID = 'ipfs'
  }
  add (object) {
    return this.ipfs.files.add(Buffer.from(JSON.stringify(object))).then(files => {
      return files[0].hash
    })
  }
  get (hash) {
    return this.ipfs.files.cat(hash).then(file => {
      return JSON.parse(file.toString())
    })
  }
  save (hash) {
    return this.ipfs.pin.add(hash).then(() => true)
  }
}

module.exports = Ipfs
