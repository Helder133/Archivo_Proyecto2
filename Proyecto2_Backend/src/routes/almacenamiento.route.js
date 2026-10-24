const express = require('express');
const router = express.Router();
const controllerAlmacenamiento = require('../controllers/almacenamiento.controller');
const { verificarToken } = require('../Middleware/auth.middleware.js');

router.get('/almacenamiento', verificarToken, controllerAlmacenamiento.getAlmacenamiento);

router.put('/almacenamiento/actualizar-limite', verificarToken, controllerAlmacenamiento.updateAlmacenamiento);

module.exports = router;