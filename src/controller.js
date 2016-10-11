let commands = require('./intero/commands')
let vscode   = require('vscode')

let getCommands = () => {
  return [
    ['intero.load', runCommand(commands.loadFile)],
    ['intero.type-of', runCommand(commands.typeForWord)],
    ['intero.usages-of', runCommand(commands.usagesForWord)],
    ['intero.definition-of', runCommand(commands.getDefinition)],
  ]
}

let runCommand = (command) => {
  return (_) => {
    let document = vscode.window.activeTextEditor.document
    
    if (document.languageId != 'haskell') return
    let uri = document.uri.path

    command(uri)  
  }
}

module.exports = {
  getCommands,
  initialize: commands.initialize,
  destroy: commands.destroy,
}
