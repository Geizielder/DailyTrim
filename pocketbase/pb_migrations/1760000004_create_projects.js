/// <reference path="../pb_data/types.d.ts" />

migrate((app) => {
  const collection = new Collection({
    name: "projects",
    type: "base",
    system: false,
    schema: [
      {
        name: "organization",
        type: "relation",
        required: true,
        maxSelect: 1,
        collectionId: "", // Will be set dynamically
        cascadeDelete: true
      },
      {
        name: "workspace",
        type: "relation",
        required: true,
        maxSelect: 1,
        collectionId: "", // Will be set dynamically
        cascadeDelete: true
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
        max: 1000
      },
      {
        name: "status",
        type: "select",
        required: true,
        maxSelect: 1,
        values: ["active", "on_hold", "completed", "archived"]
      },
      {
        name: "start_date",
        type: "date",
        required: false
      },
      {
        name: "due_date",
        type: "date",
        required: false
      },
      {
        name: "owner",
        type: "relation",
        required: false,
        maxSelect: 1,
        collectionId: "_pb_users_auth_",
        cascadeDelete: false
      },
      {
        name: "color",
        type: "text",
        required: false,
        pattern: "^#[0-9A-Fa-f]{6}$"
      },
      {
        name: "archived",
        type: "bool",
        required: false
      }
    ],
    indexes: [
      "CREATE INDEX idx_projects_org ON projects (organization)",
      "CREATE INDEX idx_projects_workspace ON projects (workspace)",
      "CREATE INDEX idx_projects_org_archived ON projects (organization, archived)",
      "CREATE INDEX idx_projects_status ON projects (status)"
    ],
    listRule: "organization.owner = @request.auth.id || organization.organization_members_via_organization.user ?= @request.auth.id",
    viewRule: "organization.owner = @request.auth.id || organization.organization_members_via_organization.user ?= @request.auth.id",
    createRule: "organization.organization_members_via_organization.user ?= @request.auth.id && organization.organization_members_via_organization.role != 'editor'",
    updateRule: "organization.organization_members_via_organization.user ?= @request.auth.id && organization.organization_members_via_organization.role != 'editor'",
    deleteRule: "organization.owner = @request.auth.id || owner = @request.auth.id"
  });

  // Set relations dynamically
  const organizations = app.dao().findCollectionByNameOrId("organizations");
  const workspaces = app.dao().findCollectionByNameOrId("workspaces");

  collection.schema[0].options = { collectionId: organizations.id };
  collection.schema[1].options = { collectionId: workspaces.id };

  return app.dao().saveCollection(collection);
}, (app) => {
  const collection = app.dao().findCollectionByNameOrId("projects");
  return app.dao().deleteCollection(collection);
});
