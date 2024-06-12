const express = require('express');
const multer = require('multer');
const pool = require('./conexion');
const jwt = require('jsonwebtoken'); // Importar la biblioteca jsonwebtoken
const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Middleware para verificar el token JWT
const verificarToken = (req, res, next) => {
  // Obtener el token del encabezado de la solicitud
  const token = req.headers['authorization'];

  // Verificar si existe el token
  if (!token) {
    return res.status(401).json({ error: 'Acceso no autorizado. Token no proporcionado.' });
  }

  try {
    // Verificar y decodificar el token
    const decoded = jwt.verify(token, 'clave'); // Reemplaza 'tu_clave_secreta' con tu propia clave secreta

    // Agregar el usuario decodificado a la solicitud
    req.usuario = decoded.usuario;

    // Continuar con la siguiente middleware
    next();
  } catch (error) {
    // Manejar errores de token inválido
    console.error('Error al verificar token:', error);
    return res.status(401).json({ error: 'Acceso no autorizado. Token inválido.' });
  }
};

// Obtener todos los usuarios (requiere autenticación)
router.get('/', verificarToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM tbl_usuario');
    const usuarios = result.rows.map(usuario => ({
      ...usuario,
      imagen: usuario.imagen ? usuario.imagen.toString('base64') : null // Convertir buffer a base64 si existe
    }));
    res.json(usuarios);
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
});

// Crear un nuevo usuario con imagen (requiere autenticación)
router.post('/', verificarToken, upload.single('imagen'), async (req, res) => {
  try {
    const { nombre_usuario, nombre, apellido, correo, contrasena } = req.body;
    const imagenBuffer = req.file ? req.file.buffer : null;
    const imagenBase64 = imagenBuffer ? imagenBuffer.toString('base64') : null; // Convertir la imagen a base64

    const query = `
      INSERT INTO tbl_usuario (nombre_usuario, nombre, apellido, correo, contrasena, imagen)
      VALUES ($1, $2, $3, $4, $5, $6) RETURNING *;
    `;
    const values = [nombre_usuario, nombre, apellido, correo, contrasena, imagenBase64]; // Guardar la imagen en formato base64
    const result = await pool.query(query, values);

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error al crear usuario:', error);
    res.status(500).json({ error: 'Error al crear usuario' });
  }
});

module.exports = router;
