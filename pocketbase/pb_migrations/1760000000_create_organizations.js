/// <reference path="../pb_data/types.d.ts" />

migrate((app) => {
  const collection = new Collection({
    name: "organizations",
    type: "base",
    system: false,
    schema: [
      {
        name: "name",
        type: "text",
        required: true,
        min: 2,
        max: 100
      },
      {
        name: "slug",
        type: "text",
        required: true,
        min: 2,
        max: 50,
        pattern: "^[a-z0-9-]+$" // lowercase, numbers, hyphens only
      },
      {
        name: "owner",
        type: "relation",
        required: true,
        maxSelect: 1,
        collectionId: "_pb_users_auth_",
        cascadeDelete: false // If user deleted, org should be handled separately
      },
      {
        name: "settings",
        type: "json",
        required: false
      },
      {
        name: "plan",
        type: "select",
        required: true,
        maxSelect: 1,
        values: ["free", "pro", "enterprise"]
      },
      {
        name: "archived",
        type: "bool",
        required: false
      }
    ],
    indexes: [
      "CREATE UNIQUE INDEX idx_organizations_slug ON organizations (slug)",
      "CREATE INDEX idx_organizations_owner ON organizations (owner)",
      "CREATE INDEX idx_organizations_archived ON organizations (archived)"
    ],
    listRule: "@request.auth.id != '' && (owner = @request.auth.id || organization_members_via_organization.user ?= @request.auth.id)",
    viewRule: "@request.auth.id != '' && (owner = @request.auth.id || organization_members_via_organization.user ?= @request.auth.id)",
    createRule: "@request.auth.id != '' && owner = @request.auth.id",
    updateRule: "owner = @request.auth.id || organization_members_via_organization.user ?= @request.auth.id && organization_members_via_organization.role ?= 'admin'",
    deleteRule: "owner = @request.auth.id"
  });

  return app.dao().saveCollection(collection);
}, (app) => {
  const collection = app.dao().findCollectionByNameOrId("organizations");
  return app.dao().deleteCollection(collection);
});
