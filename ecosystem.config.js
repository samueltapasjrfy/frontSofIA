require('dotenv').config({
  path: '.env.local',
});

module.exports = {
    apps: [
      {
        name: "SOPHIA_FRONT",
        script: "npm",
        args: `start -- -p ${process.env.PORT || 3000} `,
        env: {
          NODE_ENV: "production",
        },
      },
    ],
  };