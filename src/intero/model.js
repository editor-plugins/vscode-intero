let IdrisIdeMode = require('./intero')
let Rx           = require('rx-lite')

class InteroModel {
  constructor() {
    this.requestId = 0
    this.interoRef = null
    this.subjects = {}
    this.interoMode()
  }

  interoMode() {
    if (!this.interoRef) {
      this.interoRef = new IdrisIdeMode()
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
    if (cmd.length > 0) {
      let op = cmd[0]
      let params = cmd.slice(1, cmd.length - 1)
      let id = cmd[cmd.length - 1]
      if (this.subjects[id] != null) {
        let subject = this.subjects[id]
        switch (op) {
          case ':return':
            let ret = params[0]
            if (ret[0] === ':ok') {
              let okparams = ret[1]
              if (okparams[0] === ':metavariable-lemma') {
                subject.onNext({
                  responseType: 'return',
                  msg: okparams
                })
              } else {
                subject.onNext({
                  responseType: 'return',
                  msg: ret.slice(1)
                })
              }
            } else {
              subject.onError({
                message: ret[1],
                warnings: this.warnings[id],
                highlightInformation: ret[2],
                cwd: this.compilerOptions.src
              })
            }
            subject.onCompleted()
            delete this.subjects[id]
            break
          case ':write-string':
            let msg = params[0]
            subject.onNext({
              responseType: 'write-string',
              msg: msg
            })
            break
          case ':warning':
            let warning = params[0]
            this.warnings[id].push(warning)
            break
          case ':set-prompt':
            break
        }
      }
    }
  }

  load(uri) {
    return this.prepareCommand(`:l ${uri}\n`)
  }

  getType(uri, word) {
    return this.prepareCommand(`:type-at ${uri} 1 1 1 1 ${word}\n`)
  }

  getDefinition(uri, word) {
    return this.prepareCommand(`:loc-at ${uri} 1 1 1 1 ${word}\n`)
  }

  getUsages(uri, word) {
    return this.prepareCommand(`:uses ${uri} 1 1 1 1 ${word}\n`)
  }

  replCompletions(uri, word) {
    return this.prepareCommand(`:complete-at ${uri} 1 1 1 1 ${word}\n`)
  }
}

module.exports = InteroModel
