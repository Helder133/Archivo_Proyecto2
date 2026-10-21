const express = require('express');
const router = express.Router();
const controllerLogin = require('../controllers/login.controller');

// Ruta de login
router.post('/login', controllerLogin.controllerLogin);

// Rutas de usuario
router.use(require('./usuario.route'));

// Rutas de carpeta
router.use(require('./carpeta.route'));

// Rutas de archivo
router.use(require('./archivo.route'));

// Rutas de bitacora
router.use(require('./bitacora.route'));

// Rutas de compartido
router.use(require('./compartido.route'));

// Rutas de reporte
router.use(require('./reporte.route'));

module.exports = router;