class Bleno {
  constructor() {
    this.server = app
    this.socketio = io
    this.app.get('/', (_, res) => res.sendStatus(200))
    this.io.on('connection', this.handleConnection)
    http.listen(36363, () => {
      console.log('listening on *:36363')
    })
  }

  on(event, callback) {
    if (event == 'stateChange') {
      // calls advertisingStart
      callback('poweredOn')
    } else if (event === 'advertisingStart') {
      // calls setServices
      callback()
    }
  }

  setServices(services) {
    this.primaryService = services[0]
  }

  getChar(id) {
    for (char of this.primaryService.characteristics) {
      if (char.id === id) return char
    }
  }

  startAdvertising(name, uuids) {
    this.name = name
    this.uuid = uuids[0]
  }

  handleConnection(socket) {
    socket.on('scan', () => {
      socket.emit('scanResults')
    })
    socket.on('write', ({ uuid, data }) => {
      this.getChar(uuid).onWriteRequest(data)
    })

    socket.on('subscribe', ({ uuid, mtu }) => {
      this.getChar(uuid).onSubscribe(mtu, (data) => {
        socket.emit('updateValue', uuid, data.slice(0, mtu))
      })
    })

    socket.on('unsubscribe', ({ uuid }) => {
      this.getChar(uuid).onUnsubscribe()
    })
  }
}

module.exports = Bleno
