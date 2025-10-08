/// <reference path="../pb_data/types.d.ts" />

/**
 * Migration: Hide password field in navidrome_config
 *
 * Security fix: Password field should not be exposed in API responses
 */
migrate((app) => {
  const collection = app.findCollectionByNameOrId("navidrome_config")

  // Find the password field and set it as hidden
  collection.fields.forEach((field) => {
    if (field.name === "password") {
      field.hidden = true
    }
  })

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("navidrome_config")

  // Rollback: unhide password field
  collection.fields.forEach((field) => {
    if (field.name === "password") {
      field.hidden = false
    }
  })

  return app.save(collection)
})
