const almacenamientoService = require('../services/almacenamiento.service');

class AlmacenamientoController {

    async getAlmacenamiento(req, res) {
        try {
            const usuarioId = req.usuario.id;
            const almacenamiento = await almacenamientoService.obtenerEstadoAlmacenamiento(usuarioId);
            res.status(200).json(almacenamiento);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async updateAlmacenamiento(req, res) {
        try {
            const usuarioId = req.usuario.id;
            const { nuevoLimite } = req.body;
            await almacenamientoService.actualizarLimiteGlobal(nuevoLimite);
            res.status(200).json({ message: 'Límite de almacenamiento actualizado correctamente.' });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

}

module.exports = new AlmacenamientoController();