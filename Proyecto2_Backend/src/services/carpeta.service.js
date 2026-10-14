const carpetaDao = require('../repository/carpeta.repository');
const { ObjectId } = require('mongodb');

class CarpetaService {
    async createCarpeta(carpeta) {
        carpeta.path = carpeta.path || '/'; // Si no se proporciona una path, se establece como raíz
        if ((!carpeta.nombre || carpeta.nombre.trim() === '')
            || (!carpeta.usuarioId || carpeta.usuarioId.trim() === '')) {
            throw new Error('Faltan datos requeridos.');
        }

        const usuarioDao = require('../repository/usuario.repository');
        const usuario = await usuarioDao.findById(carpeta.usuarioId);
        if (!usuario) {
            throw new Error(`No se encontró el usuario con ID: ${carpeta.usuarioId}`);
        }

        const existe = await carpetaDao.existeNombreEnLaMismaPath(carpeta.nombre, carpeta.path);
        if (existe) {
            throw new Error(`Ya existe una carpeta con el nombre "${carpeta.nombre}" en la path "${carpeta.path}".`);
        }

        const newCarpeta = {
            nombre: carpeta.nombre,
            path: carpeta.path,
            usuarioId: new ObjectId(carpeta.usuarioId),
            fechaCreacion: new Date(),
            estado: true,
            compartidoCon: carpeta.compartidoCon || []
        }

        return await carpetaDao.create(newCarpeta);
    }

    async findCarpetaById(id) {
        const carpeta = await carpetaDao.findById(id);
        if (!carpeta) {
            throw new Error(`No se encontró la carpeta con ID: ${id}`);
        }
        return carpeta;
    }

    async findCarpetasByPath(path) {
        return await carpetaDao.findByPath(path);
    }

    async findPapeleria() {
        return await carpetaDao.findPapeleria();
    }

    async updateCarpeta(id, data) {
        const carpetaExistente = await carpetaDao.findById(id);
        if (!carpetaExistente) {
            throw new Error(`No se encontró la carpeta con ID: ${id}`);
        }

        // Si se está actualizando el nombre, verificar si ya existe en la misma path
        if (data.nombre && data.nombre !== carpetaExistente.nombre) {
            const existe = await carpetaDao.existeNombreEnLaMismaPath(data.nombre, carpetaExistente.path);
            if (existe) {
                throw new Error(`Ya existe una carpeta con el nombre "${data.nombre}" en la path "${carpetaExistente.path}".`);
            }
        }

        return await carpetaDao.update(id, data);
    }

    async moverCarpeta(pathAnterior, pathNueva) {
        const dbInstance = require('../config/database');
        const client = dbInstance.getClient();
        const session = client.startSession();

        try {
            await session.withTransaction(async () => {
                await carpetaDao.actualizarPaths(pathAnterior, pathNueva, session);
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

    async eliminarCarpetaCompleta(retuaCompleta) {
        const dbInstance = require('../config/database');
        const client = dbInstance.getClient();
        const session = client.startSession();

        try {
            await session.withTransaction(async () => {
                const archivoService = require('./archivo.service');
                await archivoService.eliminarArchivosPorPath(retuaCompleta, session);
                await carpetaDao.eliminarPorPath(retuaCompleta, session);
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
        const carpetaExistente = await carpetaDao.findByIdSinEstado(id);
        if (!carpetaExistente) {
            throw new Error(`No se encontró la carpeta con ID: ${id}`);
        }
        return await carpetaDao.toggleEstado(id);
    }

    async compartirCarpeta(id, datosCompartir) {
        const nuevosParaCompartir = [];
        for (const compartido of datosCompartir) {
            if (!compartido.usuarioId || !compartido.permiso) {
                throw new Error('Faltan datos requeridos para compartir la carpeta.');
            }
            if (!ObjectId.isValid(id) || !ObjectId.isValid(compartido.usuarioId)) {
                throw new Error('ID de carpeta o usuario inválido.');
            }
            const yaExiste = await carpetaDao.validarCompartidoCon(id, compartido.usuarioId);
            if (yaExiste) {
                await this.cambiarPermisoDeCompartido(id, compartido);
            } else {
                nuevosParaCompartir.push(compartido);
            }
        }
        if (nuevosParaCompartir.length > 0) {
            return await carpetaDao.compartirCarpeta(id, nuevosParaCompartir);
        }

        return true;
    }

    async cambiarPermisoDeCompartido(id, datosCompartido) {
        if (!datosCompartido.usuarioId || !datosCompartido.permiso) {
            throw new Error('Faltan datos requeridos para cambiar el permiso.');
        }

        if (!ObjectId.isValid(id) || !ObjectId.isValid(datosCompartido.usuarioId)) {
            throw new Error('ID de carpeta o usuario inválido.');
        }
        return await carpetaDao.cambiarPermisoDeCompartido(id, datosCompartido.usuarioId, datosCompartido.permiso);
    }

    async eliminarCompartido(id, usuarioId) {
        if (!ObjectId.isValid(id) || !ObjectId.isValid(usuarioId)) {
            throw new Error('ID de carpeta o usuario inválido.');
        }
        return await carpetaDao.eliminarCompartido(id, usuarioId);
    }

}

module.exports = new CarpetaService();