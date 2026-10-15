const usuarioService = require('../services/usuario.service.js');

class UsuarioController {
    async controllerCreateUsuario(req, res) {
        try {
            const usuarioData = req.body.usuario;
            await usuarioService.createUsuario(usuarioData);
            res.status(201).json({
                mensaje: 'Usuario creado exitosamente.'
            });
        } catch (error) {
            res.status(400).json({
                mensaje: error.message
            });
        }
    }

    async controllerUpdateUsuario(req, res) {
        try {
            const id = req.params.id;
            const data = req.body.usuario;
            await usuarioService.updateUsuario(id, data);
            res.status(200).json({
                mensaje: 'Usuario actualizado exitosamente.'
            });
        } catch (error) {
            res.status(400).json({
                mensaje: error.message
            });
        }
    }

    async controllerUpdateEstadoUsuario(req, res) {
        try {
            const id = req.params.id;
            await usuarioService.updateEstadoUsuario(id);
            res.status(200).json({
                mensaje: 'Estado del usuario actualizado exitosamente.'
            });
        } catch (error) {
            res.status(400).json({
                mensaje: error.message
            });
        }
    }

    async controllerGetUsuarioById(req, res) {
        try {
            const id = req.params.id;
            const usuario = await usuarioService.getUsuarioById(id);
            res.status(200).json({
                usuario: usuario
            });
        } catch (error) {
            res.status(404).json({
                mensaje: error.message
            });
        }
    }

    async controllerGetAllUsuarios(req, res) {
        try {
            const usuarios = await usuarioService.getAllUsuarios();
            res.status(200).json({
                usuarios: usuarios
            });
        } catch (error) {
            res.status(500).json({
                mensaje: 'Error al obtener los usuarios.'
            });
        }
    }

    async controllerGetUsuarioByCoincidence(req, res) {
        try {
            const coincidence = req.params.coincidence;
            const usuarios = await usuarioService.getUsuarioByCoincidence(coincidence);
            res.status(200).json({
                usuarios: usuarios
            });
        } catch (error) {
            res.status(500).json({
                mensaje: 'Error al obtener los usuarios.'
            });
        }
    }
}

module.exports = new UsuarioController();