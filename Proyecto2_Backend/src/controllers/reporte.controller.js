const reporteService = require('../services/reporte.service');

class ReporteController {

    // --- ARCHIVOS ---
    async cantidadArchivosPorTipo(req, res) {
        try {
            const usuarioId = req.usuarioId;
            res.json(await reporteService.cantidadArchivosPorTipo(usuarioId));
        }
        catch (error) { res.status(400).json({ error: error.message }); }
    }

    async archivosPorRangoFechas(req, res) {
        try {
            const usuarioId = req.usuarioId;
            const { inicio, fin } = req.query; // Extraídos de ?inicio=2026-01-01&fin=2026-12-31
            res.json(await reporteService.archivosPorRangoFechas(inicio, fin, usuarioId));
        } catch (error) { res.status(400).json({ error: error.message }); }
    }

    async archivosConMasOperaciones(req, res) {
        try {
            const usuarioId = req.usuarioId;
            res.json(await reporteService.archivosConMasOperaciones(usuarioId));
        }
        catch (error) { res.status(400).json({ error: error.message }); }
    }

    // --- USUARIOS ---
    async topUsuariosMasArchivos(req, res) {
        try {
            const usuarioId = req.usuarioId;
            res.json(await reporteService.topUsuariosMasArchivos(usuarioId));
        }
        catch (error) { res.status(400).json({ error: error.message }); }
    }

    async usuariosMasRecursosCompartidos(req, res) {
        try {
            const usuarioId = req.usuarioId;
            res.json(await reporteService.usuariosMasRecursosCompartidos(usuarioId));
        }
        catch (error) { res.status(400).json({ error: error.message }); }
    }

    // --- COMPARTICIÓN ---
    async archivosCompartidosConMasUsuarios(req, res) {
        try {
            const usuarioId = req.usuarioId;
            res.json(await reporteService.archivosCompartidosConMasUsuarios(usuarioId));
        }
        catch (error) { res.status(400).json({ error: error.message }); }
    }

    async recursosCompartidosPorUsuario(req, res) {
        try {
            const usuarioIdToken = req.usuarioId;
            res.json(await reporteService.recursosCompartidosPorUsuario(req.params.usuarioId, usuarioIdToken));
        }
        catch (error) { res.status(400).json({ error: error.message }); }
    }

    async recursosRecibidosPorUsuario(req, res) {
        try {
            const usuarioIdToken = req.usuarioId;
            res.json(await reporteService.recursosRecibidosPorUsuario(req.params.usuarioId, usuarioIdToken));
        }
        catch (error) { res.status(400).json({ error: error.message }); }
    }

    // --- ACTIVIDAD ---
    async historialUsuarioFechas(req, res) {
        try {
            const usuarioId = req.usuarioId;
            const { inicio, fin } = req.query;
            res.json(await reporteService.historialUsuarioFechas(req.params.usuarioId, inicio, fin, usuarioId));
        } catch (error) { res.status(400).json({ error: error.message }); }
    }

    async operacionesPorTipo(req, res) {
        try {
            const usuarioId = req.usuarioId;
            res.json(await reporteService.operacionesPorTipo(usuarioId));
        }
        catch (error) { res.status(400).json({ error: error.message }); }
    }

    async operacionesPorPeriodo(req, res) {
        try {
            const usuarioId = req.usuarioId;
            res.json(await reporteService.operacionesPorPeriodo(usuarioId));
        }
        catch (error) { res.status(400).json({ error: error.message }); }
    }

    async principalesAccionesSistema(req, res) {
        try {
            const usuarioId = req.usuarioId;
            res.json(await reporteService.principalesAccionesSistema(usuarioId));
        }
        catch (error) { res.status(400).json({ error: error.message }); }
    }
}

module.exports = new ReporteController();