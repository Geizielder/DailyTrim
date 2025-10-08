/// <reference path="../pb_data/types.d.ts" />

migrate((app) => {
  const collection = new Collection({
    name: "organization_members",
    type: "base",
    system: false,
    schema: [
      {
        name: "organization",
        type: "relation",
        required: true,
        maxSelect: 1,
        collectionId: "", // Will be set dynamically
        cascadeDelete: true // Delete membership if org deleted
      },
      {
        name: "user",
        type: "relation",
        required: true,
        maxSelect: 1,
        collectionId: "_pb_users_auth_",
        cascadeDelete: true // Delete membership if user deleted
      },
      {
        name: "role",
        type: "select",
        required: true,
        maxSelect: 1,
        values: ["admin", "editor"]
      },
      {
        name: "invited_by",
        type: "relation",
        required: false,
        maxSelect: 1,
        collectionId: "_pb_users_auth_",
        cascadeDelete: false
      }
    ],
    indexes: [
      "CREATE UNIQUE INDEX idx_org_members_unique ON organization_members (organization, user)",
      "CREATE INDEX idx_org_members_user ON organization_members (user)",
      "CREATE INDEX idx_org_members_org_role ON organization_members (organization, role)"
    ],
    listRule: "organization.owner = @request.auth.id || organization.organization_members_via_organization.user ?= @request.auth.id",
    viewRule: "organization.owner = @request.auth.id || user = @request.auth.id",
    createRule: "organization.owner = @request.auth.id || (organization.organization_members_via_organization.user ?= @request.auth.id && organization.organization_members_via_organization.role ?= 'admin')",
    updateRule: "organization.owner = @request.auth.id",
    deleteRule: "organization.owner = @request.auth.id || user = @request.auth.id"
  });

  // Set organization relation dynamically
  const organizations = app.dao().findCollectionByNameOrId("organizations");
  collection.schema[0].options = {
    collectionId: organizations.id
  };

  return app.dao().saveCollection(collection);
}, (app) => {
  const collection = app.dao().findCollectionByNameOrId("organization_members");
  return app.dao().deleteCollection(collection);
});
