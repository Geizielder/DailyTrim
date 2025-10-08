/// <reference path="../pb_data/types.d.ts" />

migrate((app) => {
  const collection = new Collection({
    name: "documents",
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
        required: false,
        maxSelect: 1,
        collectionId: "", // Will be set dynamically
        cascadeDelete: true
      },
      {
        name: "project",
        type: "relation",
        required: false,
        maxSelect: 1,
        collectionId: "", // Will be set dynamically
        cascadeDelete: true
      },
      {
        name: "task",
        type: "relation",
        required: false,
        maxSelect: 1,
        collectionId: "", // Will be set dynamically
        cascadeDelete: true
      },
      {
        name: "title",
        type: "text",
        required: true,
        min: 1,
        max: 200
      },
      {
        name: "content",
        type: "json",
        required: false
      },
      {
        name: "content_text",
        type: "text",
        required: false,
        max: 50000
      },
      {
        name: "type",
        type: "select",
        required: true,
        maxSelect: 1,
        values: ["wiki", "note", "spec", "meeting_notes"]
      },
      {
        name: "version",
        type: "number",
        required: true,
        min: 1,
        noDecimal: true
      },
      {
        name: "created_by",
        type: "relation",
        required: true,
        maxSelect: 1,
        collectionId: "_pb_users_auth_",
        cascadeDelete: false
      },
      {
        name: "last_edited_by",
        type: "relation",
        required: false,
        maxSelect: 1,
        collectionId: "_pb_users_auth_",
        cascadeDelete: false
      },
      {
        name: "archived",
        type: "bool",
        required: false
      }
    ],
    indexes: [
      "CREATE INDEX idx_documents_org ON documents (organization)",
      "CREATE INDEX idx_documents_project ON documents (project)",
      "CREATE INDEX idx_documents_task ON documents (task)",
      "CREATE INDEX idx_documents_org_type ON documents (organization, type)",
      "CREATE INDEX idx_documents_org_archived ON documents (organization, archived)"
    ],
    listRule: "organization.owner = @request.auth.id || organization.organization_members_via_organization.user ?= @request.auth.id",
    viewRule: "organization.owner = @request.auth.id || organization.organization_members_via_organization.user ?= @request.auth.id",
    createRule: "organization.organization_members_via_organization.user ?= @request.auth.id && organization.organization_members_via_organization.role != 'viewer' && created_by = @request.auth.id",
    updateRule: "organization.organization_members_via_organization.user ?= @request.auth.id && (created_by = @request.auth.id || organization.organization_members_via_organization.role ?= 'admin')",
    deleteRule: "organization.owner = @request.auth.id || created_by = @request.auth.id"
  });

  // Set relations dynamically
  const organizations = app.dao().findCollectionByNameOrId("organizations");
  const workspaces = app.dao().findCollectionByNameOrId("workspaces");
  const projects = app.dao().findCollectionByNameOrId("projects");
  const tasks = app.dao().findCollectionByNameOrId("tasks");

  collection.schema[0].options = { collectionId: organizations.id };
  collection.schema[1].options = { collectionId: workspaces.id };
  collection.schema[2].options = { collectionId: projects.id };
  collection.schema[3].options = { collectionId: tasks.id };

  return app.dao().saveCollection(collection);
}, (app) => {
  const collection = app.dao().findCollectionByNameOrId("documents");
  return app.dao().deleteCollection(collection);
});
