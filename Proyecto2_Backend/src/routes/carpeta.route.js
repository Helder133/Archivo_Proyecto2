const express = require('express');
const router = express.Router();

const controllerCarpeta = require('../controllers/carpeta.controller');
const { verificarToken } = require('../Middleware/auth.middleware.js');

router.post('/carpeta', verificarToken, controllerCarpeta.createCarpeta);
router.post('/carpeta/compartir', verificarToken, controllerCarpeta.compartirCarpeta);

router.get('/carpeta/path', verificarToken, controllerCarpeta.findCarpetasByPath);
router.get('/carpeta/papeleria', verificarToken, controllerCarpeta.findPapeleria);
router.get('/carpeta/buscar/:nombre', verificarToken, controllerCarpeta.getCarpetasByNombre);
router.get('/carpeta/:id', verificarToken, controllerCarpeta.findCarpetaById);

router.put('/carpeta/cambiar-permiso', verificarToken, controllerCarpeta.cambiarPermisoDeCompartido);
router.put('/carpeta/mover/:id', verificarToken, controllerCarpeta.moverCarpeta);
router.put('/carpeta/:id', verificarToken, controllerCarpeta.updateCarpeta);

router.patch('/carpeta/cambiar-estado/:id', verificarToken, controllerCarpeta.cambiarEstadoCarpeta);

router.delete('/carpeta/eliminar-compartido', verificarToken, controllerCarpeta.eliminarCompartido);
router.delete('/carpeta/:id', verificarToken, controllerCarpeta.eliminarCarpeta);

module.exports = router;