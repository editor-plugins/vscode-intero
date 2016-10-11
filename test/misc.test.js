let assert = require("assert")

let str1 = "Ok, modules loaded: Ntha.Core.Ast, Ntha.Type.Type, Ntha.Type.TypeScope, Ntha.Type.Infer, Ntha.State, Ntha.Z3.Assertion, Ntha.Z3.Class, Ntha.Z3.Encoding, Ntha.Z3.Logic."
let str2 = "Prelude> :set prompt \"\4\""
let str3 = "fresh :: Type -> NonGeneric -> Infer Type\n"

suite("misc", () => {
  test("should contain specific sub string", () => {
    assert.equal(str1.indexOf("Ok, modules loaded") > -1, true)
    assert.equal(str2.indexOf("Prelude>") > -1, true)
    assert.equal(str3.indexOf("\n") > -1, true)
  })
})