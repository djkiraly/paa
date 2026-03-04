module.exports = {
  apps: [
    {
      name: "paa-web",
      script: "node_modules/.bin/next",
      args: "start",
      cwd: "/var/www/panhandle-aviation",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "512M",
      env: {
        NODE_ENV: "production",
        PORT: process.env.PORT || 3000,
      },
    },
  ],
};
