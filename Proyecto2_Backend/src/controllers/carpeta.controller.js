const carpetaService = require('../services/carpeta.service');

class CarpetaController {
    async createCarpeta(req, res) {
        try {
            const carpeta = await carpetaService.createCarpeta(req.body);
            res.status(201).json(carpeta);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    async findCarpetaById(req, res) {
        try {
            const carpeta = await carpetaService.findCarpetaById(req.params.id);
            if (!carpeta) {
                return res.status(404).json({ error: 'Carpeta no encontrada' });
            }
            res.json(carpeta);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async findCarpetasByPath(req, res) {
        try {
            const carpetas = await carpetaService.findCarpetasByPath(req.params.path);
            res.json(carpetas);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async findPapeleria(req, res) {
        try {
            const carpetas = await carpetaService.findPapeleria();
            res.json(carpetas);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async updateCarpeta(req, res) {
        try {
            const updated = await carpetaService.updateCarpeta(req.params.id, req.body);
            if (!updated) {
                return res.status(404).json({ error: 'Carpeta no encontrada' });
            }
            res.json({ message: 'Carpeta actualizada correctamente' });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    async moverCarpeta(req, res) {
        try {
            const { pathAnterior, pathNueva } = req.body;
            const moved = await carpetaService.moverCarpeta(pathAnterior, pathNueva);
            if (!moved) {
                return res.status(404).json({ error: 'Carpeta no encontrada' });
            }
            res.json({ message: 'Carpeta movida correctamente' });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
}