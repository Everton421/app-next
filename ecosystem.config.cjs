module.exports = {
  apps: [
    {
      name: "app-next",
      script: "cmd",
      args: "/c next build && next start -p 8081",
      env: {
        NODE_ENV: "production",
      },
      windowsHide: true,
    },
  ],
};
