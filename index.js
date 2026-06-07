/**
 * Alternate Hostinger entry — no top-level await.
 */
import("./app.js").catch((error) => {
  console.error("[index.js] FATAL — boot failed", error);
  process.exit(1);
});
