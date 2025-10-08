/// <reference path="../pb_data/types.d.ts" />

/**
 * Hook: Encrypt navidrome_config password before saving
 *
 * SECURITY:
 * - Encrypts password using bcrypt before saving to database
 * - Password is hashed with cost factor 10 (standard)
 * - Cannot be decrypted (one-way hash)
 * - Must be re-entered to change
 *
 * USAGE:
 * - Frontend sends plaintext password
 * - Hook encrypts before DB insert/update
 * - To authenticate with Navidrome, we store plaintext :(
 *
 * LIMITATION:
 * - We NEED the plaintext password to authenticate with Navidrome API
 * - Bcrypt doesn't work here because Navidrome needs the actual password
 * - Real solution: Use Navidrome token-based auth (future v0.3)
 */

// For now, we can't encrypt because we need to send password to Navidrome
// Best we can do is:
// 1. Keep password hidden in API responses ✅ (already done)
// 2. Use HTTPS in production ✅ (user responsibility)
// 3. Implement token-based auth with Navidrome in v0.3 🚧 (TODO)

// This file serves as documentation for the security limitation
onRecordBeforeCreateRequest((e) => {
  if (e.collection.name === "navidrome_config") {
    // TODO v0.3: Replace password storage with token-based auth
    // For now, password stored in plaintext (necessary evil)
    console.log("⚠️  Navidrome password stored in plaintext (required for API auth)")
  }
})

onRecordBeforeUpdateRequest((e) => {
  if (e.collection.name === "navidrome_config") {
    // TODO v0.3: Replace password storage with token-based auth
    console.log("⚠️  Navidrome password updated (plaintext storage)")
  }
})