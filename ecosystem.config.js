module.exports = {
  apps: [
    {
      name: 'mente-sana-server',
      cwd: './packages/server',
      script: 'dist/index.js',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
      },
      env_file: './packages/server/.env',
    },
    {
      name: 'mente-sana-web',
      cwd: './packages/web',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 3006',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3006,
      },
    },
  ],
};
