/// <reference path="../pb_data/types.d.ts" />

migrate((app) => {
  const collection = app.findCollectionByNameOrId("navidrome_config")

  // Encontra o campo "password" e renomeia para "encrypted_password"
  const passwordField = collection.fields.find(f => f.name === "password")
  if (passwordField) {
    passwordField.name = "encrypted_password"
    passwordField.max = 500 // Senha criptografada é maior que plaintext
  }

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("navidrome_config")

  // Rollback: renomeia de volta para "password"
  const encryptedPasswordField = collection.fields.find(f => f.name === "encrypted_password")
  if (encryptedPasswordField) {
    encryptedPasswordField.name = "password"
    encryptedPasswordField.max = 500
  }

  return app.save(collection)
})
