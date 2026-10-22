const mongoose = require('mongoose');
const archivoRepository = require('../repository/archivo.repository');
const permisosService = require('./permisos.service');
const bitacoraService = require('./bitacora.service');
const { bitacoraEnum, moduloAfectado, permisosEnum } = require('../models/enums.enum');

class ArchivoService {

    async createArchivo(archivoData, fileBuffer) {
        archivoData.path = archivoData.path || '/'; // Si no se proporciona un path, se establece como raíz
        if (!archivoData.nombre || !archivoData.usuarioId || !fileBuffer) {
            throw new Error('Faltan datos requeridos o el archivo.');
        }

        const usuarioService = require('./usuario.service');
        const usuario = await usuarioService.getUsuarioById(archivoData.usuarioId, archivoData.usuarioId);
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
                const carpetaPadre = await carpetaService.findByNombreAndPath(nombreParent, pathParent, archivoData.usuarioId);

                if (carpetaPadre) {
                    // Validacion de permisos, si el usuario no es el dueño original, debe tener permisos de edición
                    permisosService.verificarPermiso(carpetaPadre, archivoData.usuarioId, permisosEnum.EDITAR, usuario.rol)

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

        const session = await mongoose.startSession();

        try {
            let idNuevoArchivo = null;
            await session.withTransaction(async () => {
                idNuevoArchivo = await archivoRepository.create(nuevoArchivo, session);
                await bitacoraService.registrarAccion(
                    nuevoArchivo.usuarioId,
                    bitacoraEnum.CREACION,
                    moduloAfectado.ARCHIVO,
                    nuevoArchivo.nombre,
                    idNuevoArchivo,
                    session
                );
            });

            return idNuevoArchivo;

        } catch (error) {
            console.error("Error en la transacción, ejecutando rollback físico...", error);
            await archivoRepository.eliminarBinariosGridFS([gridFsId]);
            throw error;
        } finally {
            await session.endSession();
        }
    }

    async getAllArchivos(usuarioId) {
        await bitacoraService.registrarAccion(usuarioId, bitacoraEnum.CONSULTAR_REGISTROS, moduloAfectado.ARCHIVO, 'Todos los archivos', null, null);
        return await archivoRepository.findAll();
    }

    async getArchivoById(id, usuarioId) {
        const archivo = await archivoRepository.findById(id);
        if (!archivo) throw new Error('Archivo no encontrado.');

        // Validacion de permisos, si el usuario no es el dueño original, debe tener permisos de lectura
        permisosService.verificarPermiso(archivo, usuarioId, permisosEnum.LECTURA);

        await bitacoraService.registrarAccion(usuarioId, bitacoraEnum.CONSULTAR_REGISTROS, moduloAfectado.ARCHIVO, archivo.nombre, id, null);
        return archivo;
    }

    async getArchivosByNombre(coincidencia, usuarioId) {
        if (!coincidencia || coincidencia.trim() === '') return [];

        // Escapar caracteres especiales para que la base de datos no colapse
        const textoEscapado = coincidencia.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(textoEscapado, 'i'); // 'i' para que no distinga mayúsculas y minúsculas

        await bitacoraService.registrarAccion(usuarioId, bitacoraEnum.CONSULTAR_REGISTROS, moduloAfectado.ARCHIVO, `Búsqueda por nombre: ${coincidencia}`, null, null);
        return await archivoRepository.findByNombreCoincidencia(regex, usuarioId);
    }

    async getArchivosByExtension(extension, usuarioId) {
        if (!extension || extension.trim() === '') return [];
        const extFormat = extension.startsWith('.') ? extension.trim() : `.${extension.trim()}`;
        await bitacoraService.registrarAccion(usuarioId, bitacoraEnum.CONSULTAR_REGISTROS, moduloAfectado.ARCHIVO, `Búsqueda por extensión: ${extFormat}`, null, null);
        return await archivoRepository.findByExtension(extFormat, usuarioId);
    }

    async getPapeleria(usuarioId) {
        await bitacoraService.registrarAccion(usuarioId, bitacoraEnum.CONSULTAR_REGISTROS, moduloAfectado.ARCHIVO, 'Papelera', null, null);
        return await archivoRepository.findPapeleria();
    }

    async getArchivosByPath(path, usuarioIdEjecutor) {
        await bitacoraService.registrarAccion(usuarioIdEjecutor, bitacoraEnum.CONSULTAR_REGISTROS, moduloAfectado.ARCHIVO, `Archivos en path: ${path}`, null, null);
        return await archivoRepository.findByPath(path, usuarioIdEjecutor);
    }

    // --- MÉTODO PARA DESCARGAR/LEER ---
    async descargarArchivo(id, usuarioId) {
        const archivo = await archivoRepository.findById(id);
        if (!archivo) {
            throw new Error('Archivo no encontrado o está en la papelera.');
        }
        // Validacion de permisos, si el usuario no es el dueño original, debe tener permisos de lectura
        permisosService.verificarPermiso(archivo, usuarioId, permisosEnum.LECTURA);

        await bitacoraService.registrarAccion(usuarioId, bitacoraEnum.DESCARGA, moduloAfectado.ARCHIVO, archivo.nombre, id, null);
        const stream = await archivoRepository.descargarDeGridFs(archivo.archivoGridFsId);
        return {
            stream,
            nombreCompleto: `${archivo.nombre}${archivo.tipo}`,
            tipo: archivo.tipo
        };
    }

    async actualizarContenido(id, fileBuffer, usuarioId) {
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

        // Validacion de permisos, si el usuario no es el dueño original, debe tener permisos de edición
        permisosService.verificarPermiso(archivoExistente, usuarioId, permisosEnum.EDITAR);

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

                // 4. Registramos la acción en la bitácora
                await bitacoraService.registrarAccion(usuarioId, bitacoraEnum.MODIFICACION, moduloAfectado.ARCHIVO, archivoExistente.nombre, id, session);
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

    async actualizarNombre(id, nuevoNombre, usuarioId) {
        if (!nuevoNombre || nuevoNombre.trim() === '') {
            throw new Error('El nombre es requerido.');
        }

        const archivoExistente = await archivoRepository.findById(id);
        if (!archivoExistente) {
            throw new Error('Archivo no encontrado.');
        }

        // Si el nombre no cambió, no hacemos nada
        if (archivoExistente.nombre === nuevoNombre.trim()) {
            return true;
        }

        // Validacion de permisos, si el usuario no es el dueño original, debe tener permisos de edición
        permisosService.verificarPermiso(archivoExistente, usuarioId, permisosEnum.EDITAR);

        // Validar que el nuevo nombre no exista en la misma ruta
        const existe = await archivoRepository.existeNombreEnLaMismaPath(nuevoNombre.trim(), archivoExistente.path);
        if (existe) {
            throw new Error(`Ya existe un archivo con el nombre "${nuevoNombre.trim()}" en esta ruta.`);
        }

        const session = await mongoose.startSession();

        try {
            await session.withTransaction(async () => {
                await archivoRepository.update(id, { nombre: nuevoNombre.trim(), fechaModificacion: new Date() }, session);

                await bitacoraService.registrarAccion(usuarioId, bitacoraEnum.MODIFICACION, moduloAfectado.ARCHIVO, `Renombrado de archivo: ${archivoExistente.nombre} a ${nuevoNombre}`, id, session);
            });
            return true;
        } catch (error) {
            console.error("Error al renombrar archivo:", error);
            throw error;
        } finally {
            await session.endSession();
        }
    }

    async actualizarEstadoArchivo(id, usuarioId) {
        const archivoExistente = await archivoRepository.findByIdSinEstado(id);
        if (!archivoExistente) {
            throw new Error(`No se encontró el archivo con ID: ${id}`);
        }

        // Validacion de permisos, si el usuario no es el dueño original, debe tener permisos de edición
        permisosService.verificarPermiso(archivoExistente, usuarioId, permisosEnum.EDITAR);

        const session = await mongoose.startSession();
        const accion = !archivoExistente.estado ? bitacoraEnum.ELIMINACION : bitacoraEnum.RESTAURACION;

        try {
            await session.withTransaction(async () => {
                await archivoRepository.cambiarEstadoDeArchivo(id, session);

                await bitacoraService.registrarAccion(usuarioId, accion, moduloAfectado.ARCHIVO, archivoExistente.nombre, id, session
                );
            });

            return true;
        } catch (error) {
            console.error("Error al cambiar el estado del archivo:", error);
            throw error;
        } finally {
            await session.endSession();
        }
    }

    async eliminarArchivoPermanente(id, usuarioId) {
        const archivoExistente = await archivoRepository.findByIdSinEstado(id);
        if (!archivoExistente) {
            throw new Error('Archivo no encontrado.');
        }

        // Validacion de permisos, si el usuario no es el dueño original, debe tener permisos de edición
        permisosService.verificarPermiso(archivoExistente, usuarioId, permisosEnum.EDITAR);

        const idGridFs = archivoExistente.archivoGridFsId;
        const session = await mongoose.startSession();

        try {
            await session.withTransaction(async () => {
                // 1. Eliminamos los bytes físicos de GridFS
                await archivoRepository.eliminarBinariosGridFS([idGridFs], session);

                // 2. Eliminamos la metadata lógica de Mongoose
                await archivoRepository.eliminarPorId(id, session);

                // 3. Registramos la acción en la bitácora
                await bitacoraService.registrarAccion(usuarioId, bitacoraEnum.ELIMINACION, moduloAfectado.ARCHIVO, archivoExistente.nombre, id, session);
            });
            return true;
        } catch (error) {
            console.error("Error al eliminar archivo físicamente:", error);
            throw error;
        } finally {
            await session.endSession();
        }
    }

    async compartirArchivo(id, datosCompartir, usuarioIdEjecutor) {
        const archivoExistente = await archivoRepository.findByIdSinEstado(id);
        if (!archivoExistente) throw new Error('Archivo no encontrado.');

        permisosService.verificarPermiso(archivoExistente, usuarioIdEjecutor, permisosEnum.EDITAR);

        const nuevosParaCompartir = [];
        const session = await mongoose.startSession();

        try {
            await session.withTransaction(async () => {
                for (const compartido of datosCompartir) {
                    if (!compartido.usuarioId || !compartido.permiso) {
                        throw new Error('Faltan datos requeridos para compartir el archivo.');
                    }
                    if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(compartido.usuarioId)) {
                        throw new Error('ID de archivo o usuario inválido.');
                    }

                    const yaExiste = await archivoRepository.validarCompartidoCon(id, compartido.usuarioId);
                    if (yaExiste) {
                        await archivoRepository.cambiarPermisoDeCompartido(id, compartido.usuarioId, compartido.permiso, session);
                    } else {
                        nuevosParaCompartir.push(compartido);
                    }
                }

                if (nuevosParaCompartir.length > 0) {
                    await archivoRepository.compartirArchivo(id, nuevosParaCompartir, session);
                }

                // 3. Registramos en bitácora
                const bitacoraService = require('./bitacora.service');
                await bitacoraService.registrarAccion(usuarioIdEjecutor, bitacoraEnum.COMPARTIR, moduloAfectado.ARCHIVO, archivoExistente.nombre, id, session);
            });
            return true;
        } catch (error) {
            console.error("Error al compartir archivo:", error);
            throw error;
        } finally {
            await session.endSession();
        }
    }

    async cambiarPermisoDeCompartido(id, datosCompartido, usuarioIdEjecutor) {
        const arregloACompartir = Array.isArray(datosCompartido) ? datosCompartido : [datosCompartido];
        return await this.compartirArchivo(id, arregloACompartir, usuarioIdEjecutor);
    }

    async eliminarCompartido(id, usuarioIdCompartido, usuarioIdEjecutor) {
        if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(usuarioIdCompartido)) {
            throw new Error('ID de archivo o usuario inválido.');
        }

        const archivoExistente = await archivoRepository.findByIdSinEstado(id);
        if (!archivoExistente) throw new Error('Archivo no encontrado.');

        permisosService.verificarPermiso(archivoExistente, usuarioIdEjecutor, permisosEnum.EDITAR);

        const session = await mongoose.startSession();

        try {
            await session.withTransaction(async () => {
                await archivoRepository.eliminarCompartido(id, usuarioIdCompartido, session);

                const bitacoraService = require('./bitacora.service');
                await bitacoraService.registrarAccion(usuarioIdEjecutor, bitacoraEnum.CAMBIO_PERMISO, moduloAfectado.ARCHIVO, archivoExistente.nombre, id, session);
            });
            return true;
        } catch (error) {
            console.error("Error al revocar acceso al archivo:", error);
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