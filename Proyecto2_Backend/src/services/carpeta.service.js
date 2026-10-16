const carpetaRepository = require('../repository/carpeta.repository');
const mongoose = require('mongoose');

class CarpetaService {
    async createCarpeta(carpeta) {
        carpeta.path = carpeta.path || '/';
        if ((!carpeta.nombre || carpeta.nombre.trim() === '')
            || (!carpeta.usuarioId || carpeta.usuarioId.trim() === '')) {
            throw new Error('Faltan datos requeridos.');
        }

        const usuarioRepository = require('../repository/usuario.repository');
        const usuario = await usuarioRepository.findById(carpeta.usuarioId);
        if (!usuario) {
            throw new Error(`No se encontró el usuario con ID: ${carpeta.usuarioId}`);
        }

        const existe = await carpetaRepository.existeNombreEnLaMismaPath(carpeta.nombre, carpeta.path);
        if (existe) {
            throw new Error(`Ya existe una carpeta con el nombre "${carpeta.nombre}" en la path "${carpeta.path}".`);
        }

        const newCarpeta = {
            nombre: carpeta.nombre,
            path: carpeta.path,
            usuarioId: carpeta.usuarioId,
            estado: true,
            compartidoCon: carpeta.compartidoCon || []
        }

        return await carpetaRepository.create(newCarpeta);
    }

    async findCarpetaById(id) {
        const carpeta = await carpetaRepository.findById(id);
        if (!carpeta) {
            throw new Error(`No se encontró la carpeta con ID: ${id}`);
        }
        return carpeta;
    }

    async findCarpetasByPath(path) {
        return await carpetaRepository.findByPath(path);
    }

    async findPapeleria() {
        return await carpetaRepository.findPapeleria();
    }

    async updateCarpeta(id, data) {
        console.log('Iniciando actualización de carpeta con ID:', id, 'y datos:', data);
        const carpetaExistente = await carpetaRepository.findById(id);
        if (!carpetaExistente) {
            throw new Error(`No se encontró la carpeta con ID: ${id}`);
        }

        // Si NO hay cambio de nombre (ej. solo están actualizando otro campo), hacemos un update normal
        if (!data.nombre || data.nombre === carpetaExistente.nombre) {
            console.log('No hay cambio de nombre detectado. Procediendo con actualización normal...');
            return await carpetaRepository.update(id, data);
        }

        console.log('Cambio de nombre detectado. Validando existencia de carpeta con el nuevo nombre...');
        // Si SÍ hay cambio de nombre, validamos que el nuevo nombre no choque con otra carpeta
        const existe = await carpetaRepository.existeNombreEnLaMismaPath(data.nombre, carpetaExistente.path);
        if (existe) {
            throw new Error(`Ya existe una carpeta con el nombre "${data.nombre}" en la path "${carpetaExistente.path}".`);
        }

        // Calculamos las rutas absolutas para los hijos basándonos en el nombre viejo y el nuevo
        const pathAnteriorHijos = `${carpetaExistente.path}${carpetaExistente.nombre}/`;
        console.log('Ruta anterior para hijos:', pathAnteriorHijos);
        const pathNuevaHijos = `${carpetaExistente.path}${data.nombre}/`;
        console.log('Ruta nueva para hijos:', pathNuevaHijos);

        const session = await mongoose.startSession();

        try {
            await session.withTransaction(async () => {
                // 1. Actualizamos el nombre de la carpeta padre
                await carpetaRepository.update(id, data, session);

                // 2. Propagamos el cambio de ruta a todas las subcarpetas
                await carpetaRepository.actualizarPaths(pathAnteriorHijos, pathNuevaHijos, session);

                // 3. Propagamos el cambio de ruta a todos los archivos
                const archivoService = require('./archivo.service');
                await archivoService.moverArchivos(pathAnteriorHijos, pathNuevaHijos, session);
            });
            return true;
        } catch (error) {
            console.error("Error al renombrar carpeta y actualizar descendientes:", error);
            throw error;
        } finally {
            await session.endSession();
        }
    }

    async moverCarpeta(pathAnterior, pathNueva) {
        const session = await mongoose.startSession();

        try {
            await session.withTransaction(async () => {
                await carpetaRepository.actualizarPaths(pathAnterior, pathNueva, session);
                const archivoService = require('./archivo.service');
                await archivoService.moverArchivos(pathAnterior, pathNueva, session);
            });
            return true;
        } catch (error) {
            console.error("Error al mover carpeta:", error);
            throw error;
        } finally {
            await session.endSession();
        }
    }

    async eliminarCarpetaCompleta(rutaCompleta) {
        const session = await mongoose.startSession();

        try {
            await session.withTransaction(async () => {
                const archivoService = require('./archivo.service');
                await archivoService.eliminarArchivosPorPath(rutaCompleta, session);
                await carpetaRepository.eliminarPorPath(rutaCompleta, session);
            });
            return true;
        } catch (error) {
            console.error("Error al eliminar carpeta:", error);
            throw error;
        } finally {
            await session.endSession();
        }
    }

    async actualizarEstadoCarpeta(id) {
        const carpetaExistente = await carpetaRepository.findByIdSinEstado(id);
        if (!carpetaExistente) {
            throw new Error(`No se encontró la carpeta con ID: ${id}`);
        }
        return await carpetaRepository.toggleEstado(id);
    }

    async compartirCarpeta(id, datosCompartir) {
        const carpetaExistente = await carpetaRepository.findByIdSinEstado(id);
        if (!carpetaExistente) throw new Error('Carpeta no encontrada.');

        // Calculamos la ruta absoluta que afectará a los hijos
        const rutaPadre = `${carpetaExistente.path}${carpetaExistente.nombre}/`;
        const archivoService = require('./archivo.service');
        const session = await mongoose.startSession();

        try {
            await session.withTransaction(async () => {
                for (const compartido of datosCompartir) {
                    if (!compartido.usuarioId || !compartido.permiso) {
                        throw new Error('Faltan datos requeridos para compartir la carpeta.');
                    }
                    if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(compartido.usuarioId)) {
                        throw new Error('ID de carpeta o usuario inválido.');
                    }

                    // 1. Actualizamos a la carpeta padre actual
                    const yaExiste = await carpetaRepository.validarCompartidoCon(id, compartido.usuarioId);
                    if (yaExiste) {
                        await carpetaRepository.cambiarPermisoDeCompartido(id, compartido.usuarioId, compartido.permiso, session);
                    } else {
                        await carpetaRepository.compartirCarpeta(id, [compartido], session); // Asumiendo que adaptaste este método para recibir session
                    }

                    // 2. Propagamos la herencia a descendientes (Carpetas y Archivos)
                    // Primero limpiamos rastros viejos de ese usuario
                    await carpetaRepository.removerPermisoDescendientes(rutaPadre, compartido.usuarioId, session);
                    await archivoService.removerPermisoDescendientes(rutaPadre, compartido.usuarioId, session);

                    // Luego inyectamos el nuevo permiso heredado
                    await carpetaRepository.agregarPermisoDescendientes(rutaPadre, compartido, session);
                    await archivoService.agregarPermisoDescendientes(rutaPadre, compartido, session);
                }
            });
            return true;
        } catch (error) {
            console.error("Error al propagar compartición:", error);
            throw error;
        } finally {
            await session.endSession();
        }
    }

    async cambiarPermisoDeCompartido(id, datosCompartido) {
        // En esta arquitectura, cambiar el permiso desde la raíz es exactamente el mismo flujo que compartir
        // Por lo tanto, podemos reutilizar el método superior para aplicar la cascada.
        return await this.compartirCarpeta(id, [datosCompartido]);
    }

    async eliminarCompartido(id, usuarioId) {
        if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(usuarioId)) {
            throw new Error('ID de carpeta o usuario inválido.');
        }

        const carpetaExistente = await carpetaRepository.findByIdSinEstado(id);
        if (!carpetaExistente) throw new Error('Carpeta no encontrada.');

        const rutaPadre = `${carpetaExistente.path}${carpetaExistente.nombre}/`;
        const archivoService = require('./archivo.service');
        const session = await mongoose.startSession();

        try {
            await session.withTransaction(async () => {
                // 1. Quitamos permiso al padre
                await carpetaRepository.eliminarCompartido(id, usuarioId, session);

                // 2. Quitamos permiso a toda la descendencia
                await carpetaRepository.removerPermisoDescendientes(rutaPadre, usuarioId, session);
                await archivoService.removerPermisoDescendientes(rutaPadre, usuarioId, session);
            });
            return true;
        } catch (error) {
            console.error("Error al revocar permisos en cascada:", error);
            throw error;
        } finally {
            await session.endSession();
        }
    }
}

module.exports = new CarpetaService();