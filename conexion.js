const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: '127.0.0.1',
  database: 'redsocial',
  password: 'l0renzana',
  port: 5432,
});

// Verificar la conexión a la base de datos
pool.connect((err, client, release) => {
  if (err) {
    return console.error('Error al conectar a la base de datos:', err.stack);
  }
  console.log('Conexión a la base de datos exitosa');
  release();
});

module.exports = pool;
