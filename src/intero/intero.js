let cp           = require('child_process')
let EventEmitter = require('events').EventEmitter
let vscode       = require('vscode')

class Intero extends EventEmitter {
  constructor() {
    super()
    this.process = null
    this.buffer = ''
  }

  start() {
    if ((this.process == null) || !this.process.connected) {
      let pathToStack = 'stack'
      let params = [
        'ghci',
        '--with-ghc',
        'intero',
        '--no-build',
        '--no-load'
      ]

      let root = vscode.workspace.rootPath
      
      let options = {
        cwd: root
      }

      this.process = cp.spawn(pathToStack, params, options)

      this.process.on('error', this.error)
      this.process.on('exit', this.exited)
      this.process.on('close', this.exited)
      this.process.on('disconnect', this.exited)

      if (this.process.pid) {
        this.process.stdout.setEncoding('utf8').on('data', (data) => { this.stdout(data) })
      }
    }
  }

  send(cmd) {
    console.log("send cmd => " + cmd)
    return this.process.stdin.write(cmd)
  }

  stop() {
    if (this.process != null) {
      this.process.kill()
    }
  }

  error(error) {
    let msg = error.code == 'ENOENT' 
      ? "Couldn't find stack executable at \"" + error.path + "\""
      : error.message + '(' + error.code + ')'
    vscode.window.showErrorMessage(msg)
  }

  exited(code, signal) {
    if(signal == "SIGTERM") {
      let msg = "Stack was closed"
      vscode.window.showInformationMessage(msg)
    } else {
      let short = "Stack was closed or crashed"
      let long = signal
        ? "It was closed with the signal: " + signal
        : "It (probably) crashed with the error code: " + code
      vscode.window.showErrorMessage(short + " " + long)
    }
  }

  stdout(data) {
    //console.log("data => " + data)
    this.buffer += data
    
    if (this.buffer.indexOf("Prelude>") > -1) {
      this.send(":set prompt \"\\4\"\n")
      this.buffer = ''
    }

    if (this.buffer.indexOf("Ok, modules") > -1) {
      console.log("load file success")
      this.buffer = ''
    }

    if (this.buffer.indexOf("\n") > -1) {
      console.log("buffer => " + this.buffer)
      this.buffer = ''
    }
  }
}

module.exports = Intero
