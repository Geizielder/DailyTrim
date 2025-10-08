/// <reference path="../pb_data/types.d.ts" />

/**
 * Migration: Add organization hierarchy fields to tasks
 *
 * Adds: organization, workspace, project, and other v0.3 fields
 * All fields are nullable initially for backward compatibility
 */
migrate((app) => {
  const collection = app.dao().findCollectionByNameOrId("tasks");
  const organizations = app.dao().findCollectionByNameOrId("organizations");
  const workspaces = app.dao().findCollectionByNameOrId("workspaces");
  const projects = app.dao().findCollectionByNameOrId("projects");

  // Add new fields to schema
  collection.schema.addField(new SchemaField({
    name: "organization",
    type: "relation",
    required: false, // Will be made required after population
    maxSelect: 1,
    collectionId: organizations.id,
    cascadeDelete: true
  }));

  collection.schema.addField(new SchemaField({
    name: "workspace",
    type: "relation",
    required: false,
    maxSelect: 1,
    collectionId: workspaces.id,
    cascadeDelete: true
  }));

  collection.schema.addField(new SchemaField({
    name: "project",
    type: "relation",
    required: false,
    maxSelect: 1,
    collectionId: projects.id,
    cascadeDelete: true
  }));

  collection.schema.addField(new SchemaField({
    name: "description",
    type: "text",
    required: false,
    max: 2000
  }));

  collection.schema.addField(new SchemaField({
    name: "start_date",
    type: "date",
    required: false
  }));

  // Rename due_at to due_date
  const dueAtField = collection.schema.getFieldByName("due_at");
  if (dueAtField) {
    dueAtField.name = "due_date";
  }

  collection.schema.addField(new SchemaField({
    name: "estimated_hours",
    type: "number",
    required: false,
    min: 0
  }));

  collection.schema.addField(new SchemaField({
    name: "actual_hours",
    type: "number",
    required: false,
    min: 0
  }));

  collection.schema.addField(new SchemaField({
    name: "assignee",
    type: "relation",
    required: false,
    maxSelect: 1,
    collectionId: "_pb_users_auth_",
    cascadeDelete: false
  }));

  collection.schema.addField(new SchemaField({
    name: "created_by",
    type: "relation",
    required: false,
    maxSelect: 1,
    collectionId: "_pb_users_auth_",
    cascadeDelete: false
  }));

  collection.schema.addField(new SchemaField({
    name: "parent_task",
    type: "relation",
    required: false,
    maxSelect: 1,
    collectionId: collection.id,
    cascadeDelete: false
  }));

  collection.schema.addField(new SchemaField({
    name: "tags",
    type: "json",
    required: false
  }));

  collection.schema.addField(new SchemaField({
    name: "archived",
    type: "bool",
    required: false
  }));

  return app.dao().saveCollection(collection);
}, (app) => {
  const collection = app.dao().findCollectionByNameOrId("tasks");

  // Remove added fields
  collection.schema.removeField("organization");
  collection.schema.removeField("workspace");
  collection.schema.removeField("project");
  collection.schema.removeField("description");
  collection.schema.removeField("start_date");
  collection.schema.removeField("estimated_hours");
  collection.schema.removeField("actual_hours");
  collection.schema.removeField("assignee");
  collection.schema.removeField("created_by");
  collection.schema.removeField("parent_task");
  collection.schema.removeField("tags");
  collection.schema.removeField("archived");

  // Rename due_date back to due_at
  const dueDateField = collection.schema.getFieldByName("due_date");
  if (dueDateField) {
    dueDateField.name = "due_at";
  }

  return app.dao().saveCollection(collection);
});
