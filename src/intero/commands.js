let InteroModel = require('./model')
let vscode     = require('vscode')

let model = null
let outputChannel = vscode.window.createOutputChannel('Intero')

let initialize = () => {
  if (!model) {
    model = new InteroModel()
  }
}

let getModel = () => {
  return model
}

let showLoading = () => {
  outputChannel.clear()
  outputChannel.show()
  outputChannel.append("loading...")
}

let getWord = (document, position) => {
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

let getInfoForWord = (uri, cmd) => {
  let editor = vscode.window.activeTextEditor
  let document = editor.document
  document.save()
  let position = editor.selection.active
  
  let currentWord = getWord(document, position)
  if (!currentWord) return

  let successHandler = (arg) => {
    let info = arg.msg
    outputChannel.clear()
    outputChannel.show()
    outputChannel.append(info)
  }

  new Promise((resolve, reject) => {
    model.load(uri).filter((arg) => {
      return arg.loadStatus == 'ok'
    }).flatMap(() => {
      switch (cmd) {
        case 'type':
          return model.getType(uri, position.line, position.character, currentWord)
          break
        case 'usages':
          return model.getUsages(uri, currentWord)
          break
        case 'definition':
          return model.getDefinition(uri, currentWord)
          break
      }
    }).subscribe(successHandler, displayErrors)
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

let displayErrors = (err) => {}

let destroy = () => {
  if(model != null) model.stop()
}

module.exports = {
  getWord,
  getModel,
  initialize,
  loadFile,
  typeForWord,
  usagesForWord,
  getDefinition,
  destroy
}
