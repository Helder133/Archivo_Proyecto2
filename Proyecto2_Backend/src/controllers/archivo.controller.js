const archivoService = require('../services/archivo.service');

class ArchivoController {

    async createArchivo(req, res) {
        try {
            if (!req.file) {
                return res.status(400).json({ error: 'No se proporcionó un archivo.' });
            }

            // Extraemos la extensión del nombre original (ej: documento.txt -> .txt)
            const nombreOriginal = req.file.originalname;
            const tipoExtension = nombreOriginal.substring(nombreOriginal.lastIndexOf('.'));
            const usuarioId = req.usuario.id;

            const archivoData = {
                nombre: req.body.nombre || nombreOriginal, // Si no se proporciona un nombre, usamos el original
                tipo: tipoExtension,
                path: req.body.path,
                usuarioId: usuarioId
            };

            await archivoService.createArchivo(archivoData, req.file.buffer);

            res.status(201).json({ message: 'Archivo subido exitosamente.' });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    async getAllArchivos(req, res) {
        const usuarioId = req.usuario.id;
        try {
            const archivos = await archivoService.getAllArchivos(usuarioId);
            res.json(archivos);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async getArchivoById(req, res) {
        const usuarioId = req.usuario.id;
        try {
            const archivo = await archivoService.getArchivoById(req.params.id, usuarioId);
            res.json(archivo);
        } catch (error) {
            res.status(404).json({ error: error.message });
        }
    }

    async getArchivosByNombre(req, res) {
        const usuarioId = req.usuario.id;
        try {
            const archivos = await archivoService.getArchivosByNombre(req.params.nombre, usuarioId);
            res.json(archivos);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    async getArchivosByExtension(req, res) {
        const usuarioId = req.usuario.id;
        try {
            const archivos = await archivoService.getArchivosByExtension(req.params.ext, usuarioId);
            res.json(archivos);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    async getPapeleria(req, res) {
        const usuarioId = req.usuario.id;
        try {
            const archivos = await archivoService.getPapeleria(usuarioId);
            res.json(archivos);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async getArchivosByPath(req, res) {
        const usuarioId = req.usuario.id;
        try {
            const path = req.query.path ?? '/'; // Si no se proporciona una path, se establece como raíz
            const archivos = await archivoService.getArchivosByPath(path, usuarioId);
            res.json(archivos);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    // --- MÉTODO PARA DESCARGAR/LEER ---
    async descargarArchivo(req, res) {
        const usuarioId = req.usuario.id;
        try {
            const { stream, nombreCompleto, tipo } = await archivoService.descargarArchivo(req.params.id, usuarioId);

            // Configurar el tipo de contenido según la extensión
            if (tipo === '.txt') {
                res.setHeader('Content-Type', 'text/plain');
            } else if (tipo === '.md') {
                res.setHeader('Content-Type', 'text/markdown');
            } else {
                res.setHeader('Content-Type', 'application/octet-stream');
            }

            // 'inline' permite que el navegador lo muestre en pantalla. 
            // Forzar la descarga automática, cambiarías 'inline' por 'attachment'
            res.setHeader('Content-Disposition', `inline; filename="${nombreCompleto}"`);

            // Conectar el flujo de GridFS directamente a la respuesta HTTP
            stream.pipe(res);

            // Manejo de errores a mitad de la lectura
            stream.on('error', (error) => {
                console.error("Error al leer de GridFS:", error);
                if (!res.headersSent) {
                    res.status(500).json({ error: 'Error interno al leer el archivo.' });
                }
            });

        } catch (error) {
            res.status(404).json({ error: error.message });
        }
    }

    async actualizarContenido(req, res) {
        const usuarioId = req.usuario.id;
        try {
            if (!req.file) {
                return res.status(400).json({ error: 'No se adjuntó el nuevo documento físico.' });
            }
            await archivoService.actualizarContenido(req.params.id, req.file.buffer, usuarioId);
            res.json({ message: 'Contenido del archivo actualizado correctamente.' });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    async cambiarEstadoArchivo(req, res) {
        const usuarioId = req.usuario.id;
        try {
            await archivoService.actualizarEstadoArchivo(req.params.id, usuarioId);
            res.json({ message: 'Estado del archivo cambiado correctamente.' });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    async eliminarArchivo(req, res) {
        const usuarioId = req.usuario.id;
        try {
            await archivoService.eliminarArchivoPermanente(req.params.id, usuarioId);
            res.json({ message: 'Archivo eliminado permanentemente del sistema.' });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    async compartirArchivo(req, res) {
        try {
            const { id, compartido } = req.body;
            await archivoService.compartirArchivo(id, compartido, req.usuario.id);
            res.json({ message: 'Archivo compartido correctamente' });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    async cambiarPermisoDeCompartido(req, res) {
        try {
            const { id, compartido } = req.body;
            await archivoService.cambiarPermisoDeCompartido(id, compartido, req.usuario.id);
            res.json({ message: 'Permiso del archivo actualizado correctamente' });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    async eliminarCompartido(req, res) {
        try {
            const { id, usuarioId } = req.body;
            await archivoService.eliminarCompartido(id, usuarioId, req.usuario.id);
            res.json({ message: 'Usuario eliminado del archivo correctamente' });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

}

module.exports = new ArchivoController();