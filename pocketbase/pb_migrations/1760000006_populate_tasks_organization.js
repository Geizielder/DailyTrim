/// <reference path="../pb_data/types.d.ts" />

/**
 * Migration: Populate organization field in existing tasks
 *
 * Maps each task to its owner's "Personal" organization
 * Also populates assignee and created_by from the owner field
 */
migrate((app) => {
  const tasks = app.dao().findRecordsByExpr("tasks");

  tasks.forEach((task) => {
    const ownerId = task.get("owner");

    // Find the owner's Personal organization
    const organization = app.dao().findFirstRecordByFilter(
      "organizations",
      "owner = {:owner}",
      { owner: ownerId }
    );

    if (organization) {
      // Set organization
      task.set("organization", organization.id);

      // Set assignee and created_by from owner (for backward compat)
      task.set("assignee", ownerId);
      task.set("created_by", ownerId);

      // Convert timeSpent (seconds) to actual_hours
      const timeSpent = task.get("timeSpent") || 0;
      task.set("actual_hours", timeSpent / 3600); // convert seconds to hours

      // Move notes to description
      const notes = task.get("notes");
      if (notes) {
        task.set("description", notes);
      }

      // Set archived default
      task.set("archived", false);

      // Initialize tags as empty array
      task.set("tags", []);

      app.dao().saveRecord(task);
    }
  });

  return null;
}, (app) => {
  // Rollback: Clear organization field from all tasks
  const tasks = app.dao().findRecordsByExpr("tasks");

  tasks.forEach((task) => {
    task.set("organization", null);
    task.set("workspace", null);
    task.set("project", null);
    task.set("assignee", null);
    task.set("created_by", null);
    task.set("description", null);
    task.set("actual_hours", null);
    task.set("estimated_hours", null);
    task.set("archived", null);
    task.set("tags", null);

    app.dao().saveRecord(task);
  });

  return null;
});
