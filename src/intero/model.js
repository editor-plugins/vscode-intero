let Intero = require('./intero')
let Rx     = require('rx-lite')

class InteroModel {
  constructor() {
    this.requestId = 0
    this.interoRef = null
    this.subjects = {}
    this.interoMode()
  }

  interoMode() {
    if (!this.interoRef) {
      this.interoRef = new Intero()
      this.interoRef.on('message', (obj) => { this.handleCommand(obj) })
      this.interoRef.start()
    }
    return this.interoRef
  }

  stop() {
    this.interoRef.stop()
  }

  prepareCommand(cmd) {
    let id = this.getUID()
    let subject = new Rx.Subject
    this.subjects[id] = subject
    this.interoMode().send(cmd)
    return subject
  }

  getUID() {
    return ++this.requestId
  }

  handleCommand(cmd) {
    if (this.subjects[this.requestId] == null) return
    let subject = this.subjects[this.requestId]
    if (cmd.loadStatus) {
      subject.onNext({
        loadStatus: 'ok'
      })
    } else {
      subject.onNext({
        msg: cmd
      })
    }
  }

  load(uri) {
    return this.prepareCommand(`:l ${uri}\n`)
  }

  getType(uri, l, c, word) {
    return this.prepareCommand(`:type-at ${uri} ${l + 1} ${c + 1} ${l + 1} ${c + 1} ${word}\n`)
  }

  getDefinition(uri, l, c, word) {
    return this.prepareCommand(`:loc-at ${uri} ${l + 1} ${c + 1} ${l + 1} ${c + 1} ${word}\n`)
  }

  getUsages(uri, l, c, word) {
    return this.prepareCommand(`:uses ${uri} ${l + 1} ${c + 1} ${l + 1} ${c + 1} ${word}\n`)
  }

  replCompletions(uri, l, c, word) {
    return this.prepareCommand(`:complete-at ${uri} ${l + 1} ${c + 1} ${l + 1} ${c + 1} ${word}\n`)
  }
}

module.exports = InteroModel
