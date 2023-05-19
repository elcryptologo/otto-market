module.exports = {
  apps: [
    {
      name: 'otto-market',
      script: 'pm2 start npm --name "otto-market" --start',
      watch: false,
      autorestart: true,
      error_file: './error.log',
      out_file: './output.log',
      env: {
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
