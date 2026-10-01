const express = require('express');
const router = express.Router();
const controllerLogin = require('../controllers/login.controller');

router.post('/login', controllerLogin.controllerLogin);

module.exports = router;