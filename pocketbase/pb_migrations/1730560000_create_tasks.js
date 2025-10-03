/// <reference path="../pb_data/types.d.ts" />

migrate((app) => {
  const collection = new Collection({
    name: "tasks",
    type: "base",
    system: false,
    fields: [
      {
        name: "title",
        type: "text",
        required: true,
        max: 160
      },
      {
        name: "status",
        type: "select",
        required: true,
        maxSelect: 1,
        values: ["todo","doing","done"]
      },
      {
        name: "priority",
        type: "select",
        required: false,
        maxSelect: 1,
        values: ["low","medium","high"]
      },
      {
        name: "due_at",
        type: "date",
        required: false
      },
      {
        name: "timeSpent",
        type: "number",
        required: true,
        min: 0,
        noDecimal: true
      },
      {
        name: "notes",
        type: "text",
        required: false
      },
      {
        name: "owner",
        type: "relation",
        required: true,
        maxSelect: 1,
        collectionId: "_pb_users_auth_",
        cascadeDelete: false
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
  const collection = app.findCollectionByNameOrId("tasks")
  return app.delete(collection)
})
