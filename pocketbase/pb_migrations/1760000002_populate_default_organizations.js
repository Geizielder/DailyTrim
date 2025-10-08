/// <reference path="../pb_data/types.d.ts" />

/**
 * Migration: Create default "Personal" organization for existing users
 *
 * This ensures backward compatibility - users from v0.1 automatically
 * get a "Personal" organization where all their existing tasks will live.
 */
migrate((app) => {
  const users = app.dao().findRecordsByExpr("users");

  users.forEach((user, index) => {
    // Create organization record
    const organization = new Record(app.dao().findCollectionByNameOrId("organizations"));

    // Generate unique slug from username or email
    const baseSlug = (user.get("username") || user.get("email").split("@")[0])
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");

    // Ensure slug is unique by appending index if needed
    let slug = `${baseSlug}-personal`;
    let attempts = 0;
    while (app.dao().findFirstRecordByData("organizations", "slug", slug) && attempts < 100) {
      attempts++;
      slug = `${baseSlug}-personal-${attempts}`;
    }

    organization.set("name", `${user.get("name") || user.get("username") || "My"} Personal`);
    organization.set("slug", slug);
    organization.set("owner", user.id);
    organization.set("plan", "free");
    organization.set("archived", false);
    organization.set("settings", {
      created_by_migration: true,
      created_at: new Date().toISOString()
    });

    app.dao().saveRecord(organization);
  });

  return null;
}, (app) => {
  // Rollback: Delete all "Personal" orgs created by migration
  const personalOrgs = app.dao().findRecordsByExpr(
    "organizations",
    app.dao().exp("settings", "~", "created_by_migration")
  );

  personalOrgs.forEach((org) => {
    app.dao().deleteRecord(org);
  });

  return null;
});
