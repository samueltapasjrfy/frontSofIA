require('dotenv').config();

module.exports = {
    apps: [
      {
        name: "SOPHIA_FRONT",
        script: "npm",
        args: `start -- -p ${process.env.PORT || 3000}`,
        env: {
          NODE_ENV: "production",
        },
      },
    ],
  };