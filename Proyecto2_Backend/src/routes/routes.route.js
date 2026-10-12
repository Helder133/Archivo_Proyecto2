const express = require('express');
const router = express.Router();
const controllerLogin = require('../controllers/login.controller');
const controllerUsuario = require('../controllers/usuario.controller');
const controllerCarpeta = require('../controllers/carpeta.controller');

// Rutas de login
router.post('/login', controllerLogin.controllerLogin);

// Rutas de usuario
router.post('/usuario', controllerUsuario.controllerCreateUsuario);
router.put('/usuario/:id', controllerUsuario.controllerUpdateUsuario);
router.patch('/usuario/:id/estado', controllerUsuario.controllerUpdateEstadoUsuario);
router.get('/usuario/:id', controllerUsuario.controllerGetUsuarioById);
router.get('/usuario', controllerUsuario.controllerGetAllUsuarios);
router.get('/usuario/buscar/:coincidence', controllerUsuario.controllerGetUsuarioByCoincidence);

// Rutas de carpeta
router.post('/carpeta', controllerCarpeta.createCarpeta);
router.get('/carpeta/:id', controllerCarpeta.findCarpetaById);
router.get('/carpeta/path/:path', controllerCarpeta.findCarpetasByPath);
router.get('/carpeta/papeleria', controllerCarpeta.findPapeleria);
router.put('/carpeta/:id', controllerCarpeta.updateCarpeta);
router.post('/carpeta/mover', controllerCarpeta.moverCarpeta);
router.post('/carpeta/eliminar/:path', controllerCarpeta.eliminarCarpeta);
router.post('/carpeta/compartir', controllerCarpeta.compartirCarpeta);
router.put('/carpeta/cambiar-permiso', controllerCarpeta.cambiarPermisoDeCompartido);
router.delete('/carpeta/eliminar-compartido', controllerCarpeta.eliminarCompartido);


module.exports = router;