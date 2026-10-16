const carpetaService = require('../services/carpeta.service');

class CarpetaController {
    async createCarpeta(req, res) {
        try {
            const carpeta = req.body.carpeta;
            await carpetaService.createCarpeta(carpeta);

            res.status(201).json({
                mensaje: 'Carpeta creada exitosamente.'
            });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    async findCarpetaById(req, res) {
        try {
            const carpeta = await carpetaService.findCarpetaById(req.params.id);
            res.json(carpeta);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async findCarpetasByPath(req, res) {
        try {
            const path = req.query.path ?? '/'; // Si no se proporciona una path, se establece como raíz
            const carpetas = await carpetaService.findCarpetasByPath(path);
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
            console.log('Datos recibidos para actualizar la carpeta:', req.body);
            await carpetaService.updateCarpeta(req.params.id, req.body);
            res.json({ message: 'Carpeta actualizada correctamente' });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    async moverCarpeta(req, res) {
        try {
            const { pathAnterior, pathNueva } = req.body;
            await carpetaService.moverCarpeta(pathAnterior, pathNueva);
            res.json({ message: 'Carpeta movida correctamente' });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    async cambiarEstadoCarpeta(req, res) {
        try {
            const { id } = req.params;
            await carpetaService.actualizarEstadoCarpeta(id);
            res.json({ message: 'Estado de la carpeta cambiado correctamente' });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    async eliminarCarpeta(req, res) {
        try {
            const { path } = req.params;
            await carpetaService.eliminarCarpetaCompleta(path);
            res.json({ message: 'Carpeta eliminada correctamente' });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    async compartirCarpeta(req, res) {
        try {
            const { id, compartido } = req.body;
            await carpetaService.compartirCarpeta(id, compartido);
            res.json({ message: 'Carpeta compartida correctamente' });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    async cambiarPermisoDeCompartido(req, res) {
        try {
            const { id, compartido } = req.body;
            await carpetaService.cambiarPermisoDeCompartido(id, compartido);
            res.json({ message: 'Permiso de compartido actualizado correctamente' });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    async eliminarCompartido(req, res) {
        try {
            const { id, usuarioId } = req.body;
            await carpetaService.eliminarCompartido(id, usuarioId);
            res.json({ message: 'Usuario eliminado de compartido correctamente' });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
}

module.exports = new CarpetaController();