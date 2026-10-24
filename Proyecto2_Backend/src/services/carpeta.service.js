const carpetaRepository = require('../repository/carpeta.repository');
const mongoose = require('mongoose');
const bitacoraService = require('./bitacora.service');
const permisosService = require('./permisos.service');
const { bitacoraEnum, moduloAfectado, permisosEnum } = require('../models/enums.enum');

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

        // ---LÓGICA DE HERENCIA ---
        let permisosHeredados = carpeta.compartidoCon || [];

        if (carpeta.path !== '/') {
            const partes = carpeta.path.split('/').filter(p => p !== '');
            if (partes.length > 0) {
                const nombreParent = partes.pop();
                const pathParent = partes.length > 0 ? `/${partes.join('/')}/` : '/';

                const carpetaPadre = await carpetaRepository.findByNombreAndPath(nombreParent, pathParent, carpeta.usuarioId);

                if (carpetaPadre) {
                    // Validacion de permisos, si el usuario no es el dueño original, debe tener permisos de edición
                    permisosService.verificarPermiso(carpetaPadre, carpeta.usuarioId, permisosEnum.EDITAR, usuario.rol)
                    // 1. Clonar los permisos del padre
                    permisosHeredados = carpetaPadre.compartidoCon.filter(
                        p => p.usuarioId.toString() !== carpeta.usuarioId.toString()
                    );

                    // 2. Si un usuario invitado está creando esta carpeta, el dueño original debe tener acceso
                    console.log(carpetaPadre.usuarioId.toString(), carpeta.usuarioId.toString())
                    console.log(carpetaPadre.usuarioId.toString() !== carpeta.usuarioId.toString())
                    if (carpetaPadre.usuarioId.toString() !== carpeta.usuarioId.toString()) {

                        // Verificamos que el dueño original no esté ya en el arreglo para no duplicar
                        const dueñoYaExiste = permisosHeredados.some(
                            p => p.usuarioId.toString() === carpetaPadre.usuarioId.toString()
                        );
                        console.log('Dueño ya existe:', dueñoYaExiste);
                        if (!dueñoYaExiste) {
                            permisosHeredados.push({
                                usuarioId: carpetaPadre.usuarioId,
                                permiso: 'editar' // Puedes usar tu enum permisosEnum.ESCRITURA si lo importas
                            });
                        }
                    }
                }
            }
        }

        const newCarpeta = {
            nombre: carpeta.nombre,
            path: carpeta.path,
            usuarioId: carpeta.usuarioId,
            estado: true,
            compartidoCon: permisosHeredados
        };

        const session = await mongoose.startSession();
        let idNuevaCarpeta = null;

        try {
            await session.withTransaction(async () => {
                // 1. Guardamos la carpeta asegurando la propagación de la sesión
                idNuevaCarpeta = await carpetaRepository.create(newCarpeta, session);

                // 2. Registramos la acción en la bitácora dentro de la misma transacció

                await bitacoraService.registrarAccion(
                    carpeta.usuarioId,
                    bitacoraEnum.CREACION,
                    moduloAfectado.CARPETA,
                    carpeta.nombre,
                    idNuevaCarpeta,
                    session
                );
            });

            return idNuevaCarpeta;
        } catch (error) {
            console.error("Error transaccional al crear carpeta:", error);
            throw error;
        } finally {
            await session.endSession();
        }
    }

    async findByNombreAndPath(nombre, path, usuarioId) {
        const carpeta = await carpetaRepository.findByNombreAndPath(nombre, path, usuarioId);
        if (!carpeta) {
            throw new Error(`No se encontró la carpeta con nombre: ${nombre} y path: ${path}`);
        }

        // Validacion de permisos, si el usuario no es el dueño original, debe tener permisos de lectura
        permisosService.verificarPermiso(carpeta, usuarioId, permisosEnum.LECTURA);

        await bitacoraService.registrarAccion(usuarioId, bitacoraEnum.CONSULTAR_REGISTROS, moduloAfectado.CARPETA, carpeta.nombre, carpeta._id.toString());
        return carpeta;
    }

    async findCarpetaById(id, usuarioId) {
        const carpeta = await carpetaRepository.findById(id);
        if (!carpeta) {
            throw new Error(`No se encontró la carpeta con ID: ${id}`);
        }

        // Validacion de permisos, si el usuario no es el dueño original, debe tener permisos de lectura
        permisosService.verificarPermiso(carpeta, usuarioId, permisosEnum.LECTURA);

        await bitacoraService.registrarAccion(usuarioId, bitacoraEnum.CONSULTAR_REGISTROS, moduloAfectado.CARPETA, carpeta.nombre, carpeta._id.toString());
        return carpeta;
    }

    async findCarpetasByPath(path, usuarioId) {
        await bitacoraService.registrarAccion(usuarioId, bitacoraEnum.CONSULTAR_REGISTROS, moduloAfectado.CARPETA, `Consulta de carpetas en path: ${path}`);
        return await carpetaRepository.findByPath(path, usuarioId);
    }

    async findCarpetasByPathPapelera(path, usuarioId) {
        await bitacoraService.registrarAccion(usuarioId, bitacoraEnum.CONSULTAR_REGISTROS, moduloAfectado.CARPETA, `Consulta de carpetas en papelera en path: ${path}`);
        return await carpetaRepository.findPapeleraByPath(path, usuarioId);
    }

    async findPapeleria(usuarioId) {
        await bitacoraService.registrarAccion(usuarioId, bitacoraEnum.CONSULTAR_REGISTROS, moduloAfectado.CARPETA, 'Consulta de la papelería');
        return await carpetaRepository.findPapeleria(usuarioId);
    }

    async getCarpetasByNombre(coincidencia, usuarioId) {
        await bitacoraService.registrarAccion(usuarioId, bitacoraEnum.CONSULTAR_REGISTROS, moduloAfectado.CARPETA, `Consulta de carpetas por coincidencia: ${coincidencia}`);
        if (!coincidencia || coincidencia.trim() === '') return [];

        const textoEscapado = coincidencia.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(textoEscapado, 'i'); // 'i' para que no distinga mayúsculas y minúsculas

        return await carpetaRepository.findByNombreCoincidencia(regex, usuarioId);
    }

    async updateCarpeta(id, data, usuarioId) {
        const carpetaExistente = await carpetaRepository.findById(id);
        if (!carpetaExistente) {
            throw new Error(`No se encontró la carpeta con ID: ${id}`);
        }

        // Si NO hay cambio de nombre (ej. solo están actualizando otro campo), hacemos un update normal
        if (!data.nombre || data.nombre === carpetaExistente.nombre) {
            await bitacoraService.registrarAccion(usuarioId, bitacoraEnum.MODIFICACION, moduloAfectado.CARPETA, data.nombre, id);
            return await carpetaRepository.update(id, data);
        }

        // Si SÍ hay cambio de nombre, validamos que el nuevo nombre no choque con otra carpeta
        const existe = await carpetaRepository.existeNombreEnLaMismaPath(data.nombre, carpetaExistente.path);
        if (existe) {
            throw new Error(`Ya existe una carpeta con el nombre "${data.nombre}" en la path "${carpetaExistente.path}".`);
        }

        // Calculamos las rutas absolutas para los hijos basándonos en el nombre viejo y el nuevo
        const pathAnteriorHijos = `${carpetaExistente.path}${carpetaExistente.nombre}/`;
        const pathNuevaHijos = `${carpetaExistente.path}${data.nombre}/`;

        // Validacion de permisos, si el usuario no es el dueño original, debe tener permisos de edición
        permisosService.verificarPermiso(carpetaExistente, usuarioId, permisosEnum.EDITAR);

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

                // 4. Registramos la acción en la bitácora dentro de la misma transacción
                await bitacoraService.registrarAccion(usuarioId, bitacoraEnum.MODIFICACION, moduloAfectado.CARPETA, data.nombre, id, session);
            });
            return true;
        } catch (error) {
            console.error("Error al renombrar carpeta y actualizar descendientes:", error);
            throw error;
        } finally {
            await session.endSession();
        }
    }

    async moverCarpeta(id, nuevoPathDestino, usuarioId) {
        const carpeta = await carpetaRepository.findByIdSinEstado(id);
        if (!carpeta) throw new Error('Carpeta no encontrada.');

        permisosService.verificarPermiso(carpeta, usuarioId, permisosEnum.EDITAR);

        const rutaAnterior = `${carpeta.path}${carpeta.nombre}/`;
        if (nuevoPathDestino.startsWith(rutaAnterior)) {
            throw new Error('No puedes mover una carpeta dentro de sí misma.');
        }

        // --- VALIDACIÓN DE DESTINO GENERAL ---
        let carpetaDestino = null;
        if (nuevoPathDestino !== '/') {
            carpetaDestino = await carpetaRepository.findByRutaExactaSegura(nuevoPathDestino, carpeta.usuarioId, usuarioId);
            if (!carpetaDestino) throw new Error('La ruta de destino no existe.');

            // Validamos que quien ejecuta la acción pueda escribir en esa carpeta
            permisosService.verificarPermiso(carpetaDestino, usuarioId, permisosEnum.EDITAR);
        }
        // -------------------------------------

        // --- BLINDAJE DE SEGURIDAD PARA COMPARTIDOS ---
        if (carpeta.usuarioId.toString() !== usuarioId.toString()) {
            if (nuevoPathDestino === '/' || carpeta.path === '/') {
                throw new Error('No puedes mover elementos desde o hacia la raíz del propietario original.');
            }

            const carpetaOrigen = await carpetaRepository.findByRutaExactaSegura(carpeta.path, carpeta.usuarioId, usuarioId);
            if (!carpetaOrigen) throw new Error('Carpeta de origen inválida.');
            permisosService.verificarPermiso(carpetaOrigen, usuarioId, permisosEnum.EDITAR);

            // Evitar secuestro
            if (carpetaDestino.usuarioId.toString() !== carpeta.usuarioId.toString()) {
                const originalTieneAcceso = carpetaDestino.compartidoCon.some(
                    c => c.usuarioId.toString() === carpeta.usuarioId.toString()
                );
                if (!originalTieneAcceso) {
                    throw new Error('No puedes mover la carpeta a un espacio privado. El propietario original debe tener acceso al destino.');
                }
            }
        }
        // ----------------------------------------------

        const rutaNueva = `${nuevoPathDestino}${carpeta.nombre}/`;
        const session = await mongoose.startSession();

        try {
            await session.withTransaction(async () => {
                const archivoService = require('./archivo.service');
                await carpetaRepository.actualizarPathIndividual(id, nuevoPathDestino, session);
                await carpetaRepository.actualizarPathsDescendencia(rutaAnterior, rutaNueva, session);
                await archivoService.actualizarPathsDescendencia(rutaAnterior, rutaNueva, session);

                await bitacoraService.registrarAccion(usuarioId, bitacoraEnum.MODIFICACION, moduloAfectado.CARPETA, `Se movió a ${nuevoPathDestino}`, id, session);
            });
            return true;
        } catch (error) {
            console.error("Error al mover carpeta:", error);
            throw error;
        } finally {
            await session.endSession();
        }
    }

    async eliminarCarpetaCompleta(id, usuarioId) {
        // 1. Validamos que exista por ID (y de paso obtenemos sus datos)
        const carpetaExistente = await carpetaRepository.findByIdSinEstado(id);
        if (!carpetaExistente) {
            throw new Error('Carpeta no encontrada o ID inválido.');
        }

        // 2. Armamos la ruta completa a partir de la base de datos, no del frontend
        const rutaCompleta = `${carpetaExistente.path}${carpetaExistente.nombre}/`;

        // Validacion de permisos, si el usuario no es el dueño original, debe tener permisos de edición
        permisosService.verificarPermiso(carpetaExistente, usuarioId, permisosEnum.EDITAR);

        const session = await mongoose.startSession();

        try {
            await session.withTransaction(async () => {
                const archivoService = require('./archivo.service');

                // 3. Destruimos la descendencia y a la carpeta misma con el Regex
                await archivoService.eliminarArchivosPorPath(rutaCompleta, session);
                await carpetaRepository.eliminarPorPath(rutaCompleta, session);
                await bitacoraService.registrarAccion(usuarioId, bitacoraEnum.ELIMINACION, moduloAfectado.CARPETA, carpetaExistente.nombre, id, session);
            });
            return true;
        } catch (error) {
            console.error("Error al eliminar carpeta en cascada:", error);
            throw error;
        } finally {
            await session.endSession();
        }
    }

    async actualizarEstadoCarpeta(id, usuarioId) {
        const carpetaExistente = await carpetaRepository.findByIdSinEstado(id);
        if (!carpetaExistente) {
            throw new Error(`No se encontró la carpeta seleccionada.`);
        }

        // Calculamos cuál será el nuevo estado (el inverso del actual)
        const nuevoEstado = !carpetaExistente.estado;

        // Calculamos la ruta letal que afectará a los hijos
        const rutaPadre = `${carpetaExistente.path}${carpetaExistente.nombre}/`;

        // Validacion de permisos, si el usuario no es el dueño original, debe tener permisos de edición
        permisosService.verificarPermiso(carpetaExistente, usuarioId, permisosEnum.EDITAR);

        const archivoService = require('./archivo.service');
        const session = await mongoose.startSession();
        const accion = nuevoEstado ? bitacoraEnum.RESTAURACION : bitacoraEnum.ELIMINACION;

        try {
            await session.withTransaction(async () => {
                // 1. Actualizamos explícitamente a la carpeta padre
                await carpetaRepository.actualizarEstado(id, nuevoEstado, session);

                // 2. Propagamos el mismo estado a todas las subcarpetas
                await carpetaRepository.cambiarEstadoDescendientes(rutaPadre, nuevoEstado, session);

                // 3. Propagamos el mismo estado a todos los archivos
                await archivoService.cambiarEstadoDescendientes(rutaPadre, nuevoEstado, session);

                // 4. Registramos la acción en la bitácora dentro de la misma transacción
                await bitacoraService.registrarAccion(usuarioId, accion, moduloAfectado.CARPETA, carpetaExistente.nombre, id, session);
            });
            return nuevoEstado;
        } catch (error) {
            console.error("Error al cambiar estado en cascada:", error);
            throw error;
        } finally {
            await session.endSession();
        }
    }

    async compartirCarpeta(id, datosCompartir, usuarioId) {
        console.log('Iniciando proceso de compartir carpeta con ID:', id, 'y datos:', datosCompartir);
        const carpetaExistente = await carpetaRepository.findByIdSinEstado(id);
        if (!carpetaExistente) throw new Error('Carpeta no encontrada.');

        // Validacion de permisos, si el usuario no es el dueño original, debe tener permisos de edición
        permisosService.verificarPermiso(carpetaExistente, usuarioId, permisosEnum.EDITAR);

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
                        await carpetaRepository.compartirCarpeta(id, [compartido], session);
                    }

                    // 2. Propagamos la herencia a descendientes (Carpetas y Archivos)
                    // Primero limpiamos rastros viejos de ese usuario
                    await carpetaRepository.removerPermisoDescendientes(rutaPadre, compartido.usuarioId, session);
                    await archivoService.removerPermisoDescendientes(rutaPadre, compartido.usuarioId, session);

                    // Luego inyectamos el nuevo permiso heredado
                    await carpetaRepository.agregarPermisoDescendientes(rutaPadre, compartido, session);
                    await archivoService.agregarPermisoDescendientes(rutaPadre, compartido, session);

                    // 3. Registramos la acción en la bitácora dentro de la misma transacción
                    await bitacoraService.registrarAccion(usuarioId, bitacoraEnum.COMPARTIR, moduloAfectado.CARPETA, carpetaExistente.nombre, id, session);
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

    async cambiarPermisoDeCompartido(id, datosCompartido, usuarioId) {
        const arregloACompartir = Array.isArray(datosCompartido) ? datosCompartido : [datosCompartido];

        // Reutilizamos el método superior para aplicar la cascada sin romper la estructura
        return await this.compartirCarpeta(id, arregloACompartir, usuarioId);
    }

    async eliminarCompartido(id, usuarioIdCompartido, usuarioIdEjecutor) {
        if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(usuarioIdCompartido)) {
            throw new Error('ID de carpeta o usuario inválido.');
        }

        const carpetaExistente = await carpetaRepository.findByIdSinEstado(id);
        if (!carpetaExistente) throw new Error('Carpeta no encontrada.');

        // Validacion de permisos, si el usuario no es el dueño original, debe tener permisos de edición
        permisosService.verificarPermiso(carpetaExistente, usuarioIdEjecutor, permisosEnum.EDITAR);

        const rutaPadre = `${carpetaExistente.path}${carpetaExistente.nombre}/`;
        const archivoService = require('./archivo.service');
        const session = await mongoose.startSession();

        try {
            await session.withTransaction(async () => {
                // 1. Quitamos permiso al padre
                await carpetaRepository.eliminarCompartido(id, usuarioIdCompartido, session);

                // 2. Quitamos permiso a toda la descendencia
                await carpetaRepository.removerPermisoDescendientes(rutaPadre, usuarioIdCompartido, session);
                await archivoService.removerPermisoDescendientes(rutaPadre, usuarioIdCompartido, session);

                // 3. Registramos la acción en la bitácora dentro de la misma transacción
                await bitacoraService.registrarAccion(usuarioIdEjecutor, bitacoraEnum.CAMBIO_PERMISO, moduloAfectado.CARPETA, carpetaExistente.nombre, id, session);
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