module.exports = class Protocols {
    constructor(protocols) {
        this.protocols = protocols
    }
    get(protocol) {
        if(protocol in this.protocols) {
            return this.protocols[protocol]
        } else {
            throw `Protocol '${protocol}' not initialized`
        }
    }
    to({protocol, recipient, channel, action, parameters, listen}) {
        return this.get(protocol).to(recipient, channel, action, parameters, listen)
    }
    on({protocol,  channel, action, response}) {
        return this.get(protocol).on(channel, action, response)
    }
}