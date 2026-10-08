const express = require('express');
const router = express.Router();
const controllerLogin = require('../controllers/login.controller');
const controllerUsuario = require('../controllers/usuario.controller');

// Rutas de login
router.post('/login', controllerLogin.controllerLogin);

// Rutas de usuario
router.post('/usuario', controllerUsuario.controllerCreateUsuario);
router.put('/usuario/:id', controllerUsuario.controllerUpdateUsuario);
router.patch('/usuario/:id/estado', controllerUsuario.controllerUpdateEstadoUsuario);
router.get('/usuario/:id', controllerUsuario.controllerGetUsuarioById);
router.get('/usuario', controllerUsuario.controllerGetAllUsuarios);
router.get('/usuario/buscar/:coincidence', controllerUsuario.controllerGetUsuarioByCoincidence);

module.exports = router;