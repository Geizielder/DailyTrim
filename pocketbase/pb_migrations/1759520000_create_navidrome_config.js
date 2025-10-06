/// <reference path="../pb_data/types.d.ts" />

migrate((app) => {
  const collection = new Collection({
    name: "navidrome_config",
    type: "base",
    system: false,
    fields: [
      {
        name: "server_url",
        type: "text",
        required: true,
        max: 200
      },
      {
        name: "username",
        type: "text",
        required: true,
        max: 100
      },
      {
        name: "password",
        type: "text",
        required: true,
        max: 500
      },
      {
        name: "owner",
        type: "relation",
        required: true,
        maxSelect: 1,
        collectionId: "_pb_users_auth_",
        cascadeDelete: true
      }
    ],
    listRule: "owner = @request.auth.id",
    viewRule: "owner = @request.auth.id",
    createRule: "@request.auth.id != '' && owner = @request.auth.id",
    updateRule: "owner = @request.auth.id",
    deleteRule: "owner = @request.auth.id"
  })

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("navidrome_config")
  return app.delete(collection)
})
