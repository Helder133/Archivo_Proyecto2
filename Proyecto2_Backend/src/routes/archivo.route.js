const express = require('express');
const multer = require('multer');
const router = express.Router();

const controllerArchivo = require('../controllers/archivo.controller');
const { verificarToken } = require('../Middleware/auth.middleware.js');

const upload = multer({ storage: multer.memoryStorage() }); // Configuración de multer para almacenar en memoria

// upload.single('archivoFisico') indica que Angular mandará el archivo bajo esa clave
router.post('/archivo', verificarToken, upload.single('archivoFisico'), controllerArchivo.createArchivo);
router.post('/archivo/compartir', verificarToken, controllerArchivo.compartirArchivo);

router.get('/archivo', verificarToken, controllerArchivo.getAllArchivos);
router.get('/archivo/path', verificarToken, controllerArchivo.getArchivosByPath);
router.get('/archivo/papeleria', verificarToken, controllerArchivo.getPapeleria);
router.get('/archivo/buscar/:nombre', verificarToken, controllerArchivo.getArchivosByNombre);
router.get('/archivo/extension/:ext', verificarToken, controllerArchivo.getArchivosByExtension);
router.get('/archivo/descargar/:id', verificarToken, controllerArchivo.descargarArchivo);
router.get('/archivo/:id', verificarToken, controllerArchivo.getArchivoById);

router.put('/archivo/cambiar-permiso', verificarToken, controllerArchivo.cambiarPermisoDeCompartido);
router.put('/archivo/contenido/:id', verificarToken, upload.single('archivoFisico'), controllerArchivo.actualizarContenido);
router.put('/archivo/renombrar/:id', verificarToken, controllerArchivo.renombrarArchivo);

router.patch('/archivo/cambiar-estado/:id', verificarToken, controllerArchivo.cambiarEstadoArchivo);

router.delete('/archivo/eliminar-compartido', verificarToken, controllerArchivo.eliminarCompartido);
router.delete('/archivo/:id', verificarToken, controllerArchivo.eliminarArchivo);

module.exports = router;