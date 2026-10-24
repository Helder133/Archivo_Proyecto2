const carpetaService = require('../services/carpeta.service');

class CarpetaController {

    async createCarpeta(req, res) {
        const usuarioId = req.usuario.id;

        try {
            const carpeta = req.body.carpeta;
            carpeta.usuarioId = usuarioId;
            await carpetaService.createCarpeta(carpeta);

            res.status(201).json({
                mensaje: 'Carpeta creada exitosamente.'
            });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    async findCarpetaById(req, res) {
        const usuarioId = req.usuario.id;
        try {
            const carpeta = await carpetaService.findCarpetaById(req.params.id, usuarioId);
            res.json(carpeta);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async findCarpetasByPath(req, res) {
        const usuarioId = req.usuario.id;
        try {
            const path = req.query.path ?? '/'; // Si no se proporciona una path, se establece como raíz
            const carpetas = await carpetaService.findCarpetasByPath(path, usuarioId);
            res.json(carpetas);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async findPapeleria(req, res) {
        const usuarioId = req.usuario.id;
        try {
            const carpetas = await carpetaService.findPapeleria(usuarioId);
            res.json(carpetas);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async getCarpetasByNombre(req, res) {
        try {
            const usuarioId = req.usuario.id;
            const { nombre } = req.params;
            const carpetas = await carpetaService.getCarpetasByNombre(nombre, usuarioId);
            res.status(200).json(carpetas);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    async updateCarpeta(req, res) {
        const usuarioId = req.usuario.id;
        try {
            await carpetaService.updateCarpeta(req.params.id, req.body, usuarioId);
            res.json({ message: 'Carpeta actualizada correctamente' });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    async moverCarpeta(req, res) {   
        try {
            const usuarioId = req.usuario.id;
            const { id } = req.params;
            const { nuevoPathDestino } = req.body;
            await carpetaService.moverCarpeta(id, nuevoPathDestino, usuarioId);
            res.json({ message: 'Carpeta movida correctamente' });
        } catch (error) {
            res.status(400).json({ mensaje: error.message });
        }
    }

    async cambiarEstadoCarpeta(req, res) {
        const usuarioId = req.usuario.id;
        try {
            const { id } = req.params;
            await carpetaService.actualizarEstadoCarpeta(id, usuarioId);
            res.json({ message: 'Estado de la carpeta cambiado correctamente' });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    async eliminarCarpeta(req, res) {
        try {
            const usuarioId = req.usuario.id;
            const { id } = req.params;
            await carpetaService.eliminarCarpetaCompleta(id, usuarioId);
            res.json({ message: 'Carpeta eliminada correctamente' });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    async compartirCarpeta(req, res) {
        try {
            const usuarioId = req.usuario.id;
            const { id, compartido } = req.body;
            await carpetaService.compartirCarpeta(id, compartido, usuarioId);
            res.json({ message: 'Carpeta compartida correctamente' });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    async cambiarPermisoDeCompartido(req, res) {
        try {
            const usuarioId = req.usuario.id;
            const { id, compartido } = req.body;
            await carpetaService.cambiarPermisoDeCompartido(id, compartido, usuarioId);
            res.json({ message: 'Permiso de compartido actualizado correctamente' });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    async eliminarCompartido(req, res) {
        const usuarioId = req.usuario.id;
        try {
            const { id, usuarioIdCompartido } = req.body;
            await carpetaService.eliminarCompartido(id, usuarioIdCompartido, usuarioId);
            res.json({ message: 'Usuario eliminado de compartido correctamente' });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
}

module.exports = new CarpetaController();