let commands = require('./intero/commands')
let vscode   = require('vscode')

let InteroHoverProvider = (function () {
    function InteroHoverProvider() {}

    InteroHoverProvider.prototype.provideHover = function (document, position, token) {
        let uri = document.uri.path
        let currentWord = commands.getWord(document, position)
        if (!currentWord) return

        return new Promise((resolve, reject) => {
          commands.getModel().load(uri).filter((arg) => {
            return arg.loadStatus == 'ok'
          }).flatMap(() => {
            return commands.getModel().getType(uri, position.line, position.character, currentWord)
          }).subscribe(function(arg) {
              resolve(arg.msg)
          })
        }).then(function (result) {
            if (result) {
                return new vscode.Hover(result)
            } else {
                return null
            }
        })
    }
    return InteroHoverProvider
}())

module.exports = {
    InteroHoverProvider
}
