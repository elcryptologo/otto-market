module.exports = {
  apps: [
    {
      name: 'otto-market',
      script: './node_modules/next/dist/bin/next',
      args: `start -p ${process.env.PORT || 3000}`,
      watch: false,
      autorestart: true,
      error_file: './error.log',
      out_file: './output.log',
      env_development: {
        NODE_ENV: 'development',
        PORT: 3000,
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 8080,
      },
    },
  ],
};
