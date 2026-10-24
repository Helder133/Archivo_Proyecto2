const express = require('express');
const router = express.Router();
const controllerPapelera = require('../controllers/papelera.controller');
const { verificarToken } = require('../Middleware/auth.middleware.js');

router.get('/papelera', verificarToken, controllerPapelera.getPapelera);
router.get('/papelera/archivo', verificarToken, controllerPapelera.getPapeleriaArchivos);
router.get('/papelera/carpeta', verificarToken, controllerPapelera.getPapeleriaCarpetas);

module.exports = router;