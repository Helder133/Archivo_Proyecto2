const loginService = require('../services/login.service.js');

class LoginController {
    async controllerLogin(req, res) {
        try {
            const {Login} = req.body;

            const resultado = await loginService.login(Login);

            res.status(200).json({
                mensaje: 'Login exitoso.',
                token: resultado.token,
                usuario: resultado.usuario
            });

        } catch (error) {
            res.status(401).json({
                mensaje: error.message || 'Credenciales inválidas.'
            });
        }
    }

}

module.exports = new LoginController();