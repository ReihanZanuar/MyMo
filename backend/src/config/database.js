const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

pool.on('connect', () => {
  console.log('Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

const originalQuery = pool.query.bind(pool);
pool.query = function(...args) {
  const start = Date.now();
  const query = args[0];
  const params = args[1];

  return originalQuery(...args).then(result => {
    const duration = Date.now() - start;

    if (duration > 100) {
      console.warn(`[SLOW QUERY - ${duration}ms]`, {
        query: typeof query === 'string' ? query.substring(0, 100) : query.text?.substring(0, 100),
        params: params ? `${params.length} params` : 'no params',
        rows: result.rows?.length || 0
      });
    } else if (duration > 50) {
      console.log(`[Query - ${duration}ms]`, {
        query: typeof query === 'string' ? query.substring(0, 80) : query.text?.substring(0, 80),
        rows: result.rows?.length || 0
      });
    }

    return result;
  }).catch(err => {
    const duration = Date.now() - start;
    console.error(`[QUERY ERROR - ${duration}ms]`, {
      query: typeof query === 'string' ? query.substring(0, 100) : query.text?.substring(0, 100),
      error: err.message
    });
    throw err;
  });
};

module.exports = pool;
