/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_2873630990");

  return app.delete(collection);
}, (app) => {
  const collection = new Collection({
    "createRule": "@request.auth.id != '' && owner = @request.auth.id",
    "deleteRule": "owner = @request.auth.id",
    "fields": [
      {
        "autogeneratePattern": "[a-z0-9]{15}",
        "hidden": false,
        "id": "text3208210256",
        "max": 15,
        "min": 15,
        "name": "id",
        "pattern": "^[a-z0-9]+$",
        "presentable": false,
        "primaryKey": true,
        "required": true,
        "system": true,
        "type": "text"
      },
      {
        "autogeneratePattern": "",
        "hidden": false,
        "id": "text1579384326",
        "max": 100,
        "min": 2,
        "name": "name",
        "pattern": "",
        "presentable": false,
        "primaryKey": false,
        "required": true,
        "system": false,
        "type": "text"
      },
      {
        "autogeneratePattern": "",
        "hidden": false,
        "id": "text2560465762",
        "max": 50,
        "min": 2,
        "name": "slug",
        "pattern": "^[a-z0-9-]+$",
        "presentable": false,
        "primaryKey": false,
        "required": true,
        "system": false,
        "type": "text"
      },
      {
        "cascadeDelete": false,
        "collectionId": "_pb_users_auth_",
        "hidden": false,
        "id": "relation3479234172",
        "maxSelect": 1,
        "minSelect": 0,
        "name": "owner",
        "presentable": false,
        "required": true,
        "system": false,
        "type": "relation"
      },
      {
        "hidden": false,
        "id": "json3846545605",
        "maxSize": 0,
        "name": "settings",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "json"
      },
      {
        "hidden": false,
        "id": "select3713686397",
        "maxSelect": 1,
        "name": "plan",
        "presentable": false,
        "required": true,
        "system": false,
        "type": "select",
        "values": [
          "free",
          "pro",
          "enterprise"
        ]
      },
      {
        "hidden": false,
        "id": "bool1639016958",
        "name": "archived",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "bool"
      }
    ],
    "id": "pbc_2873630990",
    "indexes": [
      "CREATE UNIQUE INDEX idx_organizations_slug ON organizations (slug)",
      "CREATE INDEX idx_organizations_owner ON organizations (owner)",
      "CREATE INDEX idx_organizations_archived ON organizations (archived)"
    ],
    "listRule": "@request.auth.id != '' && owner = @request.auth.id",
    "name": "organizations",
    "system": false,
    "type": "base",
    "updateRule": "owner = @request.auth.id",
    "viewRule": "@request.auth.id != '' && owner = @request.auth.id"
  });

  return app.save(collection);
})
