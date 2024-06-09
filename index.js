const express = require('express');
const bodyParser = require('body-parser');
const pool = require('./conexion');
const publicacionesRouter = require('./publicaciones');
const usuariosRouter = require('./usuarios');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/publicaciones', publicacionesRouter);
app.use('/usuarios', usuariosRouter);

app.get('/', (req, res) => {
  res.send('Bienvenido a la API de la red social');
});

// Iniciar el servidor después de verificar la conexión a la base de datos
pool.connect((err, client, release) => {
  if (err) {
    return console.error('Error al conectar a la base de datos:', err.stack);
  }
  console.log('Conexión a la base de datos exitosa');
  release();
  
  app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
  });
});
