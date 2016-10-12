let vscode     = require('vscode')
let controller = require('./controller')
let typeHover  = require('./interoTypeHover')

let HASKELL_MODE = { language: 'haskell', scheme: 'file' }

function activate(context) {
  controller.initialize()
  controller.getCommands().forEach(([key, value]) => {
    let disposable = vscode.commands.registerCommand(key, value)
    context.subscriptions.push(disposable)
  })
  context.subscriptions.push(vscode.languages.registerHoverProvider(HASKELL_MODE, new typeHover.InteroHoverProvider()))
}
exports.activate = activate

function deactivate() {
  controller.destroy()
}
exports.deactivate = deactivate
