const archivoRepository = require('../repository/archivo.repository');

class ArchivoService {

    async createArchivo(archivoData, fileBuffer) {
        archivoData.path = archivoData.path || '/'; // Si no se proporciona un path, se establece como raíz
        if (!archivoData.nombre || !archivoData.usuarioId || !fileBuffer) {
            throw new Error('Faltan datos requeridos o el archivo.');
        }

        const usuarioService = require('./usuario.service');
        const usuario = await usuarioService.getUsuarioById(archivoData.usuarioId);
        if (!usuario) throw new Error('Usuario no encontrado.');

        const exist = await archivoRepository.existeNombreEnLaMismaPath(archivoData.nombre, archivoData.path);
        if (exist) {
            throw new Error('Ya existe un archivo con el mismo nombre en la misma ruta.');
        }

        // INICIO DE LA HERENCIA 
        let permisosHeredados = [];
        if (archivoData.path !== '/') {
            const partes = archivoData.path.split('/').filter(p => p !== '');
            if (partes.length > 0) {
                const nombreParent = partes.pop();
                const pathParent = partes.length > 0 ? `/${partes.join('/')}/` : '/';

                const carpetaService = require('./carpeta.service');
                const carpetaPadre = await carpetaService.findByNombreAndPath(nombreParent, pathParent);

                if (carpetaPadre) {
                    // clonamos excluyendo al creador del archivo
                    permisosHeredados = carpetaPadre.compartidoCon.filter(
                        p => p.usuarioId.toString() !== archivoData.usuarioId.toString()
                    );

                    // Si el creador no es el dueño original de la carpeta padre
                    if (carpetaPadre.usuarioId.toString() !== archivoData.usuarioId.toString()) {
                        const dueñoYaExiste = permisosHeredados.some(
                            p => p.usuarioId.toString() === carpetaPadre.usuarioId.toString()
                        );
                        if (!dueñoYaExiste) {
                            permisosHeredados.push({
                                usuarioId: carpetaPadre.usuarioId,
                                permiso: 'editar'
                            });
                        }
                    }
                }
            }
        }

        // Subimos los bytes a GridFS
        const gridFsId = await archivoRepository.subirAGridFs(archivoData.nombre, fileBuffer);
        // Armamos el documento final con la metadata
        const nuevoArchivo = {
            nombre: archivoData.nombre,
            tipo: archivoData.tipo,
            path: archivoData.path,
            usuarioId: archivoData.usuarioId,
            archivoGridFsId: gridFsId,
            estado: true,
            compartidoCon: permisosHeredados
        };

        return await archivoRepository.create(nuevoArchivo);
    }

    async getAllArchivos() {
        return await archivoRepository.findAll();
    }

    async getArchivoById(id) {
        const archivo = await archivoRepository.findById(id);
        if (!archivo) throw new Error('Archivo no encontrado.');
        return archivo;
    }

    async getArchivosByNombre(coincidencia) {
        if (!coincidencia || coincidencia.trim() === '') return [];

        // Escapar caracteres especiales para que la base de datos no colapse
        const textoEscapado = coincidencia.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(textoEscapado, 'i'); // 'i' para que no distinga mayúsculas y minúsculas

        return await archivoRepository.findByNombreCoincidencia(regex);
    }

    async getArchivosByExtension(extension) {
        if (!extension || extension.trim() === '') return [];
        const extFormat = extension.startsWith('.') ? extension.trim() : `.${extension.trim()}`;
        return await archivoRepository.findByExtension(extFormat);
    }

    async getPapeleria() {
        return await archivoRepository.findPapeleria();
    }

    // --- MÉTODO PARA DESCARGAR/LEER ---
    async descargarArchivo(id) {
        const archivo = await archivoRepository.findById(id);
        if (!archivo) {
            throw new Error('Archivo no encontrado o está en la papelera.');
        }
        const stream = await archivoRepository.descargarDeGridFs(archivo.archivoGridFsId);
        return {
            stream,
            nombreCompleto: `${archivo.nombre}${archivo.tipo}`,
            tipo: archivo.tipo
        };
    }

    async actualizarContenido(id, fileBuffer) {
        if (!fileBuffer) {
            throw new Error('No se proporcionó el nuevo contenido del archivo.');
        }

        const archivoExistente = await archivoRepository.findById(id);
        if (!archivoExistente) {
            throw new Error('Archivo no encontrado.');
        }

        const idGridFsViejo = archivoExistente.archivoGridFsId;

        // 1. Subimos el nuevo contenido a GridFS (Fuera de la transacción porque los streams no la soportan)
        const idGridFsNuevo = await archivoRepository.subirAGridFs(archivoExistente.nombre, fileBuffer);

        const session = await mongoose.startSession();

        try {
            await session.withTransaction(async () => {
                // 2. Actualizamos la metadata en Mongoose
                const dataAActualizar = {
                    archivoGridFsId: idGridFsNuevo,
                    fechaModificacion: new Date()
                };

                // Asegúrate de que tu método update reciba y pase la sesión
                await archivoRepository.update(id, dataAActualizar, session);

                // 3. Eliminamos el archivo viejo usando la sesión
                await archivoRepository.eliminarBinariosGridFS([idGridFsViejo], session);
            });

            return true;
        } catch (error) {
            // 4. ROLLBACK MANUAL: Si la transacción falló, Mongoose y el archivo viejo están a salvo.
            // Pero el archivo nuevo se quedó flotando como basura. Lo eliminamos.
            console.error("Transacción fallida. Ejecutando limpieza del archivo huérfano...", error);
            await archivoRepository.eliminarBinariosGridFS([idGridFsNuevo]);
            throw error;
        } finally {
            await session.endSession();
        }
    }

    async actualizarEstadoArchivo(id) {
        const archivoExistente = await archivoRepository.findByIdSinEstado(id);
        if (!archivoExistente) {
            throw new Error(`No se encontró el archivo con ID: ${id}`);
        }
        return await archivoRepository.cambiarEstadoDeArchivo(id);
    }

    async eliminarArchivoPermanente(id) {
        const archivoExistente = await archivoRepository.findByIdSinEstado(id);
        if (!archivoExistente) {
            throw new Error('Archivo no encontrado.');
        }

        const idGridFs = archivoExistente.archivoGridFsId;
        const session = await mongoose.startSession();

        try {
            await session.withTransaction(async () => {
                // 1. Eliminamos los bytes físicos de GridFS
                await archivoRepository.eliminarBinariosGridFS([idGridFs], session);

                // 2. Eliminamos la metadata lógica de Mongoose
                await archivoRepository.eliminarPorId(id, session);
            });
            return true;
        } catch (error) {
            console.error("Error al eliminar archivo físicamente:", error);
            throw error;
        } finally {
            await session.endSession();
        }
    }

    // ----------------------------- Metodos que son llamadaos si ocurre un cambio desde una carpeta ---------------------------------
    async moverArchivos(pathAnterior, pathNueva, session) {
        return await archivoRepository.actualizarPaths(pathAnterior, pathNueva, session);
    }

    async cambiarEstadoDescendientes(rutaPadre, nuevoEstado, session) {
        return await archivoRepository.cambiarEstadoDescendientes(rutaPadre, nuevoEstado, session);
    }

    async eliminarArchivosPorPath(path, session) {
        // Primero, obtenemos los IDs de los archivos en GridFS que se van a eliminar
        const idsGridFS = await archivoRepository.obtenerIdsGridFSPorPath(path, session);

        // Luego, eliminamos los archivos binarios de GridFS
        await archivoRepository.eliminarBinariosGridFS(idsGridFS, session);

        // Finalmente, eliminamos los documentos de la colección de archivos
        return await archivoRepository.eliminarPorPath(path, session);
    }

    async agregarPermisoDescendientes(pathPadre, datosCompartido, session) {
        return await archivoRepository.agregarPermisoDescendientes(pathPadre, datosCompartido, session);
    }

    async removerPermisoDescendientes(pathPadre, usuarioId, session) {
        return await archivoRepository.removerPermisoDescendientes(pathPadre, usuarioId, session);
    }

}

module.exports = new ArchivoService();