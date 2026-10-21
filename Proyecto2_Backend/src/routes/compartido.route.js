const express = require('express');
const router = express.Router();

const controllerCompartido = require('../controllers/compartido.controller');
const { verificarToken } = require('../Middleware/auth.middleware.js');

router.get('/compartido', verificarToken, controllerCompartido.getCompartidosConmigo);

module.exports = router;