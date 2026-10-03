const loginService = require('../services/login.service.js');
const { Usuario } = require('../models/usuario.model.js');

class LoginController {
    async controllerLogin(req, res) {
        try {
            const {Login} = req.body;

            if (!Login || !Login.email || !Login.password) {
                return res.status(400).json({
                    mensaje: 'El email y la contraseña son requeridos.'
                });
            }

            // Llamar al servicio de login
            // const login = await loginService.login(Login);

            const usuario = new Usuario(
                {
                    nombre: 'Usuario de ejemplo',
                    email: Login.email,
                    password: Login.password
                }
            );

            res.status(200).json({
                mensaje: 'Login exitoso.',
                usuario: usuario
            });

        } catch (error) {
            console.error('Error en el controlador de login:', error);
            res.status(500).json({
                mensaje: 'Error interno del servidor.'
            });
        }
    }
}

module.exports = new LoginController();