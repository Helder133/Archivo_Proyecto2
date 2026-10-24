const papeleraService = require('../services/papelera.service');

class PapeleraController {

    async getPapelera(req, res) {
        try {
            const usuarioId = req.usuario.id; 
            const resultados = await papeleraService.getPapelera(usuarioId);
            res.status(200).json(resultados);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async getPapeleriaArchivos(req, res) {
        try {
            const usuarioId = req.usuario.id;
            const path = req.query.path || ''; // Obtener el path desde la query, si no se proporciona, usar una cadena vacía
            const archivos = await papeleraService.getPapeleriaArchivos(path, usuarioId);
            res.status(200).json(archivos);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async getPapeleriaCarpetas(req, res) {
        try {
            const usuarioId = req.usuario.id;
            const path = req.query.path || ''; // Obtener el path desde la query, si no se proporciona, usar una cadena vacía
            const carpetas = await papeleraService.getPapeleriaCarpetas(path, usuarioId);
            res.status(200).json(carpetas);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}

module.exports = new PapeleraController();