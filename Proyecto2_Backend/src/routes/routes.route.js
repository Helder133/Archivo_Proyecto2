const express = require('express');
const router = express.Router();
const controllerLogin = require('../controllers/login.controller');

// Rutas de login
router.post('/login', controllerLogin.controllerLogin);

// Rutas de usuario
router.use(require('./usuario.route'));

// Rutas de carpeta
router.use(require('./carpeta.route'));


module.exports = router;