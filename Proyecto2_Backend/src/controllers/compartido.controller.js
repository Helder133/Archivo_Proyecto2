const compartidoService = require('../services/compartido.service');

class CompartidoController {

    async getCompartidosConmigo(req, res) {
        try {
            const usuarioId = req.usuario.id; 
            const resultados = await compartidoService.getCompartidosConmigo(usuarioId);
            res.status(200).json(resultados);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

}

module.exports = new CompartidoController();