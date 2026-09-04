module.exports = {
  apps: [
    {
      name: "app-next",
      script: "npm",
      args: "run start:prod",
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};
