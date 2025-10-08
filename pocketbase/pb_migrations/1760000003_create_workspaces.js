/// <reference path="../pb_data/types.d.ts" />

migrate((app) => {
  const collection = new Collection({
    name: "workspaces",
    type: "base",
    system: false,
    schema: [
      {
        name: "organization",
        type: "relation",
        required: true,
        maxSelect: 1,
        collectionId: "", // Will be set dynamically
        cascadeDelete: true // Delete workspace if org deleted
      },
      {
        name: "name",
        type: "text",
        required: true,
        min: 2,
        max: 100
      },
      {
        name: "description",
        type: "text",
        required: false,
        max: 500
      },
      {
        name: "color",
        type: "text",
        required: false,
        pattern: "^#[0-9A-Fa-f]{6}$" // hex color
      },
      {
        name: "icon",
        type: "text",
        required: false,
        max: 10 // emoji or icon name
      },
      {
        name: "archived",
        type: "bool",
        required: false
      }
    ],
    indexes: [
      "CREATE INDEX idx_workspaces_org ON workspaces (organization)",
      "CREATE INDEX idx_workspaces_org_archived ON workspaces (organization, archived)"
    ],
    listRule: "organization.owner = @request.auth.id || organization.organization_members_via_organization.user ?= @request.auth.id",
    viewRule: "organization.owner = @request.auth.id || organization.organization_members_via_organization.user ?= @request.auth.id",
    createRule: "organization.owner = @request.auth.id || (organization.organization_members_via_organization.user ?= @request.auth.id && organization.organization_members_via_organization.role ?= 'admin')",
    updateRule: "organization.owner = @request.auth.id || (organization.organization_members_via_organization.user ?= @request.auth.id && organization.organization_members_via_organization.role ?= 'admin')",
    deleteRule: "organization.owner = @request.auth.id"
  });

  // Set organization relation dynamically
  const organizations = app.dao().findCollectionByNameOrId("organizations");
  collection.schema[0].options = {
    collectionId: organizations.id
  };

  return app.dao().saveCollection(collection);
}, (app) => {
  const collection = app.dao().findCollectionByNameOrId("workspaces");
  return app.dao().deleteCollection(collection);
});
