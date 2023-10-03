module.exports = ({ env }) => ({
  connection: {
    client: 'postgres',
    connection: {
      host: env('PGHOST', 'containers-us-west-188.railway.app'),
      port: env.int('PGPORT', 7337),
      database: env('PGDATABASE', 'railway'),
      user: env('PGUSER', 'postgres'),
      password: env('PGPASSWORD', 'd7QH45zrDbhS0erjEIJb'),
      ssl: env.bool(true),
    },
    pool: { min: 0 }
  },
});
