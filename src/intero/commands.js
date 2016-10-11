let InteroModel = require('./model')
let vscode     = require('vscode')

let model = null
let outputChannel = vscode.window.createOutputChannel('Intero')
let diagnosticCollection = vscode.languages.createDiagnosticCollection()

let initialize = () => {
  if (!model) {
    model = new InteroModel()
  }
}

let showLoading = () => {
  outputChannel.clear()
  outputChannel.show()
  outputChannel.append("loading...")
}

let getWord = () => {
  let editor = vscode.window.activeTextEditor
  let document = editor.document
  document.save()
  let position = editor.selection.active
  let wordRange = document.getWordRangeAtPosition(position)
  let currentWord = document.getText(wordRange)
  if (currentWord.match(/\r|\n| /g)) {
    outputChannel.clear()
    vscode.window.showWarningMessage("Please move cursor to an Identifier")
    return null
  } else {
    return currentWord
  }
}

let loadFile = (uri) => {
  let successHandler = (_) => {
    outputChannel.clear()
    outputChannel.show()
    outputChannel.append("Intero: File loaded successfull")
    diagnosticCollection.clear()
  }

  new Promise((resolve, reject) => {
    model.load(uri).filter((arg) => {
      return arg.responseType === 'return'
    }).subscribe(successHandler, displayErrors)
    showLoading()
    resolve()
  }).then(function () {
  }).catch(function () {
  })
}

let cmdMsgs = {
  type: 'Type of',
  usages: 'Usages of',
  definition: 'Definition of'
}

let getInfoForWord = (uri, cmd) => {
  let currentWord = getWord()
  if (!currentWord) return

  let successHandler = (arg) => {
    let info = arg.msg[0]
    let highlightingInfo = arg.msg[1]
    outputChannel.clear()
    outputChannel.show()
    outputChannel.appendLine('Intero: ' + cmdMsgs[cmd] + ' ' + currentWord)
    outputChannel.append(info)
    diagnosticCollection.clear()
  }

  new Promise((resolve, reject) => {
    /*model.load(uri).filter((arg) => {
      return arg.responseType === 'return'
    }).flatMap(() => {
      switch (cmd) {
        case 'type':
          return model.getType(uri, currentWord)
          break
        case 'usages':
          return model.getUsages(uri, currentWord)
          break
        case 'definition':
          return model.getDefinition(uri, currentWord)
          break
      }
    }).subscribe(successHandler, displayErrors)*/
    model.getType(uri, currentWord).subscribe(successHandler, displayErrors)
    showLoading()
    resolve()
  }).then(function () {
  }).catch(function () {
  })
}

let typeForWord = (uri) => {
  getInfoForWord(uri, 'type')
}

let usagesForWord = (uri) => {
  getInfoForWord(uri, 'usages')
}

let getDefinition = (uri) => {
  getInfoForWord(uri, 'definition')
}

let displayErrors = (err) => {
  replChannel.clear()
  aproposChannel.clear()
  outputChannel.clear()
  outputChannel.show()
  diagnosticCollection.clear()
  let buf = []
  let diagnostics = []
  if (err.warnings) {
    let len = err.warnings.length
    buf.push("Errors (" + len + ")")
    err.warnings.forEach(function(w) {
      let file = w[0].replace("./", err.cwd + "/")
      let line = w[1][0]
      let char = w[1][1]
      let message = w[3]
      buf.push(file + ":" + line + ":" + char)
      buf.push(message)
      buf.push("")
      if (line > 0) {
        let range = new vscode.Range(line - 1, char - 1, line, 0)
        let diagnostic = new vscode.Diagnostic(range, message, vscode.DiagnosticSeverity.Error)
        diagnostics.push([vscode.Uri.file(file), [diagnostic]])
      }
    })
    outputChannel.appendLine(buf.join('\n'))
    diagnosticCollection.set(diagnostics)
  }
}

let destroy = () => {
  if(model != null) model.stop()
}

module.exports = {
  diagnosticCollection,
  initialize,
  loadFile,
  typeForWord,
  usagesForWord,
  getDefinition,
  destroy
}
