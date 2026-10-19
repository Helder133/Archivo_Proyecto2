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

            const archivoData = {
                nombre: req.body.nombre || nombreOriginal, // Si no se proporciona un nombre, usamos el original
                tipo: tipoExtension,
                path: req.body.path,
                usuarioId: req.body.usuarioId
            };

            await archivoService.createArchivo(archivoData, req.file.buffer);

            res.status(201).json({ message: 'Archivo subido exitosamente.' });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    async getAllArchivos(req, res) {
        try {
            const archivos = await archivoService.getAllArchivos();
            res.json(archivos);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async getArchivoById(req, res) {
        try {
            const archivo = await archivoService.getArchivoById(req.params.id);
            res.json(archivo);
        } catch (error) {
            res.status(404).json({ error: error.message });
        }
    }

    async getArchivosByNombre(req, res) {
        try {
            const archivos = await archivoService.getArchivosByNombre(req.params.nombre);
            res.json(archivos);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    async getArchivosByExtension(req, res) {
        try {
            const archivos = await archivoService.getArchivosByExtension(req.params.ext);
            res.json(archivos);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    async getPapeleria(req, res) {
        try {
            const archivos = await archivoService.getPapeleria();
            res.json(archivos);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    // --- MÉTODO PARA DESCARGAR/LEER ---
    async descargarArchivo(req, res) {
        try {
            const { stream, nombreCompleto, tipo } = await archivoService.descargarArchivo(req.params.id);

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
        try {
            if (!req.file) {
                return res.status(400).json({ error: 'No se adjuntó el nuevo documento físico.' });
            }
            await archivoService.actualizarContenido(req.params.id, req.file.buffer);
            res.json({ message: 'Contenido del archivo actualizado correctamente.' });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    async cambiarEstadoArchivo(req, res) {
        try {
            await archivoService.actualizarEstadoArchivo(req.params.id);
            res.json({ message: 'Estado del archivo cambiado correctamente.' });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    async eliminarArchivo(req, res) {
        try {
            await archivoService.eliminarArchivoPermanente(req.params.id);
            res.json({ message: 'Archivo eliminado permanentemente del sistema.' });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

}

module.exports = new ArchivoController();