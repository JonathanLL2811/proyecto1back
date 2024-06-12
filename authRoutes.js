const express = require('express');
const pool = require('./conexion');
const jwt = require('jsonwebtoken');

const router = express.Router();

// Configurar la clave secreta JWT desde el archivo .env
const JWT_SECRET = process.env.JWT_SECRET || 'clave_secreta';

// Ruta para iniciar sesión
router.post('/', async (req, res) => {
  const { nombre_usuario, contrasena } = req.body;

  try {
    // Consultar la base de datos para obtener todos los usuarios
    const result = await pool.query('SELECT * FROM tbl_usuario');

    // Verificar las credenciales contra el arreglo de usuarios
    const usuario = result.rows.find(user => user.nombre_usuario === nombre_usuario && user.contrasena === contrasena);

    if (usuario) {
      // Credenciales válidas, generar un token JWT
      const token = jwt.sign({ usuario: nombre_usuario }, JWT_SECRET, { expiresIn: '1h' });
      res.status(200).json({ message: 'Inicio de sesión exitoso', token });
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
