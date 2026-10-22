const usuarioService = require('../services/usuario.service.js');

class UsuarioController {
    async controllerCreateUsuario(req, res) {
        try {
            const usuarioId = req.usuario.id;
            const usuarioData = req.body.usuario;
            await usuarioService.createUsuario(usuarioData, usuarioId);
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
            const usuarioId = req.usuario.id;
            const id = req.params.id;
            const data = req.body.usuario || req.body;
            await usuarioService.updateUsuario(id, data, usuarioId);
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
            const usuarioId = req.usuario.id;
            await usuarioService.updateEstadoUsuario(id, usuarioId);
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
            const usuarioId = req.usuario.id;
            const id = req.params.id;
            const usuario = await usuarioService.getUsuarioById(id, usuarioId);
            res.status(200).json(usuario);
        } catch (error) {
            res.status(404).json({
                mensaje: error.message
            });
        }
    }

    async controllerGetAllUsuarios(req, res) {
        try {
            const usuarioId = req.usuario.id;
            const usuarios = await usuarioService.getAllUsuarios(usuarioId);
            res.status(200).json(usuarios);
        } catch (error) {
            res.status(500).json({
                mensaje: 'Error al obtener los usuarios.'
            });
        }
    }

    async controllerGetUsuarioByCoincidence(req, res) {
        try {
            const usuarioId = req.usuario.id;
            const coincidence = req.params.coincidence;
            const usuarios = await usuarioService.getUsuarioByCoincidence(coincidence, usuarioId);
            res.status(200).json(usuarios);
        } catch (error) {
            res.status(500).json({
                mensaje: 'Error al obtener los usuarios.'
            });
        }
    }

    async controllerGetUsuariosDisponibles(req, res) {
        try {
            const { tipo, recursoId } = req.params;
            const usuarios = await usuarioService.getUsuariosDisponibles(tipo, recursoId);

            res.status(200).json(usuarios);
        } catch (error) {
            res.status(400).json({
                mensaje: error.message
            });
        }
    }

}

module.exports = new UsuarioController();