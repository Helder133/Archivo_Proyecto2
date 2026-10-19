const express = require('express');
const router = express.Router();

const controllerUsuario = require('../controllers/usuario.controller');
const { verificarToken } = require('../Middleware/auth.middleware.js');

router.post('/usuario', verificarToken, controllerUsuario.controllerCreateUsuario);

router.get('/usuario', verificarToken, controllerUsuario.controllerGetAllUsuarios);
router.get('/usuario/buscar/:coincidence', verificarToken, controllerUsuario.controllerGetUsuarioByCoincidence);
router.get('/usuario/:id', verificarToken, controllerUsuario.controllerGetUsuarioById);

router.put('/usuario/:id', verificarToken, controllerUsuario.controllerUpdateUsuario);

router.patch('/usuario/:id/estado', verificarToken, controllerUsuario.controllerUpdateEstadoUsuario);


module.exports = router;