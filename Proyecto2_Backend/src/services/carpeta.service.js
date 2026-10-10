const carpetaDao = require('../daos/carpeta.dao');
const { ObjectId } = require('mongodb');

class CarpetaService {
    async createCarpeta(carpeta) {
        carpeta.ruta = carpeta.ruta || '/'; // Si no se proporciona una ruta, se establece como raíz
        if ((!carpeta.nombre || carpeta.nombre.trim() === '')
            && (!carpeta.usuarioId || carpeta.usuarioId.trim() === '')) {
            throw new Error('Faltan datos requeridos.');
        }

        const usuarioDao = require('../daos/usuario.dao');
        const usuario = await usuarioDao.findById(carpeta.usuarioId);
        if (!usuario) {
            throw new Error(`No se encontró el usuario con ID: ${carpeta.usuarioId}`);
        }

        const existe = await carpetaDao.existeNombreEnLaMismaRuta(carpeta.nombre, carpeta.ruta);
        if (existe) {
            throw new Error(`Ya existe una carpeta con el nombre "${carpeta.nombre}" en la ruta "${carpeta.ruta}".`);
        }

        const newCarpeta = {
            nombre: carpeta.nombre,
            ruta: carpeta.ruta,
            usuario_id: new ObjectId(carpeta.usuarioId),
            fechaCreacion: new Date(),
            estado: true,
            compartidoCon: carpeta.compartidoCon || []
        }

        return await carpetaDao.create(newCarpeta);
    }



    async findCarpetaById(id) {
        return await carpetaDao.findById(id);
    }

    async findCarpetasByRuta(ruta) {
        return await carpetaDao.findByRuta(ruta);
    }

    async findPapeleria() {
        return await carpetaDao.findPapeleria();
    }

    async updateCarpeta(id, data) {
        const carpetaExistente = await carpetaDao.findById(id);
        if (!carpetaExistente) {
            throw new Error(`No se encontró la carpeta con ID: ${id}`);
        }

        // Si se está actualizando el nombre, verificar si ya existe en la misma ruta
        if (data.nombre && data.nombre !== carpetaExistente.nombre) {
            const existe = await carpetaDao.existeNombreEnLaMismaRuta(data.nombre, carpetaExistente.ruta);
            if (existe) {
                throw new Error(`Ya existe una carpeta con el nombre "${data.nombre}" en la ruta "${carpetaExistente.ruta}".`);
            }
        }

        return await carpetaDao.update(id, data);
    }

    async moverCarpeta(rutaAnterior, rutaNueva) {
        const dbInstance = require('../config/database');
        const client = dbInstance.getClient();
        const session = client.startSession();

        try {
            await session.withTransaction(async () => {
                await carpetaDao.actualizarRutas(rutaAnterior, rutaNueva, session);
                // Aquí también deberías llamar a la función de actualización de rutas del archivoDAO si es necesario
            });
            return true;
        } catch (error) {
            console.error("Error al mover carpeta:", error);
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



}

module.exports = new CarpetaService();