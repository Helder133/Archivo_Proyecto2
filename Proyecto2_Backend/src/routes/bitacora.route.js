const express = require('express');
const router = express.Router();

const controllerBitacora = require('../controllers/bitacora.controller');
const { verificarToken } = require('../Middleware/auth.middleware.js');

router.get('/bitacora', verificarToken, controllerBitacora.obtenerHistorial);

module.exports = router;