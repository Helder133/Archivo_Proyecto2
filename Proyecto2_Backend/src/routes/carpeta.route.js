const express = require('express');
const router = express.Router();

const controllerCarpeta = require('../controllers/carpeta.controller');

router.post('/carpeta', controllerCarpeta.createCarpeta);
router.get('/carpeta/path', controllerCarpeta.findCarpetasByPath);
router.get('/carpeta/papeleria', controllerCarpeta.findPapeleria);
router.get('/carpeta/:id', controllerCarpeta.findCarpetaById);
router.put('/carpeta/:id', controllerCarpeta.updateCarpeta);
router.post('/carpeta/mover', controllerCarpeta.moverCarpeta);
router.post('/carpeta/eliminar/:path', controllerCarpeta.eliminarCarpeta);
router.post('/carpeta/compartir', controllerCarpeta.compartirCarpeta);
router.put('/carpeta/cambiar-permiso', controllerCarpeta.cambiarPermisoDeCompartido);
router.delete('/carpeta/eliminar-compartido', controllerCarpeta.eliminarCompartido);

module.exports = router;