// index.js
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const pool = require('./conexion');
const authRoutes = require('./authRoutes'); // Importa el enrutador de autenticación
const publicacionesRouter = require('./publicaciones');
const usuariosRouter = require('./usuarios');

const app = express();
const PORT = process.env.PORT || 3000;

// Configurar CORS
app.use(cors());

// Aumentar el límite de tamaño de carga a 10MB
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));

// Usa el enrutador de autenticación en la ruta '/auth'
app.use('/auth', authRoutes);

// Usa los enrutadores de publicaciones y usuarios en sus respectivas rutas
app.use('/publicaciones', publicacionesRouter);
app.use('/usuarios', usuariosRouter);

app.get('/', (req, res) => {
  res.send('Bienvenido a la API de la red social');
});

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

