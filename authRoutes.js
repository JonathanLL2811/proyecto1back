const express = require('express');
const pool = require('./conexion');
const router = express.Router();

// Ruta para iniciar sesión
router.post('/', async (req, res) => {
  const { nombre_usuario, contrasena } = req.body;

  console.log('Datos recibidos:', { nombre_usuario, contrasena }); // Log para verificar los datos recibidos

  try {
    // Consulta la base de datos para obtener todos los usuarios
    const result = await pool.query('SELECT * FROM tbl_usuario');

    console.log('Usuarios en la base de datos:', result.rows); // Log para verificar los usuarios en la base de datos

    // Verifica las credenciales contra el arreglo de usuarios
    const usuario = result.rows.find(user => user.nombre_usuario === nombre_usuario && user.contrasena === contrasena);

    if (usuario) {
      // Credenciales válidas, devuelve un token de autenticación u otra respuesta apropiada
      res.status(200).json({ message: 'Inicio de sesión exitoso' });
    } else {
      // Credenciales inválidas
      res.status(401).json({ error: 'Credenciales incorrectas' });
    }
  } catch (error) {
    console.error('Error al iniciar sesión:', error);
    res.status(500).json({ error: 'Error al iniciar sesión' });
  }
});

module.exports = router;
