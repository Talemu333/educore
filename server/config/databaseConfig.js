const path = require("node:path");
const dotenv = require("dotenv");

// Load the server-local .env when scripts are launched from the repository root.
// Existing process environment variables (for example on Render/Vercel) remain
// authoritative because dotenv does not override them by default.
dotenv.config({ path: path.resolve(__dirname, "../.env") });

a const = null;
