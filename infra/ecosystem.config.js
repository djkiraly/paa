const fs = require("fs");
const path = require("path");

// Load .env file into env vars for PM2
const envPath = path.join("/var/www/paa", ".env");
const envVars = { NODE_ENV: "production" };
try {
  const lines = fs.readFileSync(envPath, "utf8").split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const idx = trimmed.indexOf("=");
    if (idx > 0) {
      envVars[trimmed.slice(0, idx).trim()] = trimmed.slice(idx + 1).trim();
    }
  }
} catch (_) {
  // .env not found — rely on system env vars
}

module.exports = {
  apps: [
    {
      name: "paa-web",
      script: ".next/standalone/server.js",
      cwd: "/var/www/paa",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "512M",
      env: envVars,
    },
  ],
};
