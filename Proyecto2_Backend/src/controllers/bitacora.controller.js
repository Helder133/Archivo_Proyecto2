const bitacoraService = require('../services/bitacora.service');

class BitacoraController {
    
    async obtenerHistorial(req, res) {
        try {
            const usuarioId = req.usuario.id;
            const historial = await bitacoraService.obtenerHistorialCompleto(usuarioId);
            res.status(200).json(historial);
        } catch (error) {
            console.error("Error al obtener la bitácora:", error);
            res.status(500).json({ error: 'Error interno al consultar el historial.' });
        }
    }

}

module.exports = new BitacoraController();