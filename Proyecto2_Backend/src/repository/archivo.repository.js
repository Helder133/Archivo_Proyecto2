const mongoose = require('mongoose');
const ArchivoModel = require('../models/archivo.model');
const dbInstance = require('../config/database');
const { Readable } = require('stream');

class ArchivoRepository {

    async existeNombreEnLaMismaPath(nombre, path) {
        const result = await ArchivoModel.exists({ nombre, path });
        return result !== null;
    }

    async create(archivo) {
        const nuevoArchivo = await ArchivoModel.create(archivo);
        return nuevoArchivo._id.toString();
    }

    async subirAGridFs(nombreArchivo, buffer) {
        const bucket = dbInstance.getBucket();

        return new Promise((resolve, reject) => {
            const uploadStream = bucket.openUploadStream(nombreArchivo);
            const readableStream = Readable.from(buffer); // Convertimos el buffer en un stream

            readableStream.pipe(uploadStream)
                .on('error', reject)
                .on('finish', () => resolve(uploadStream.id)); // Retorna el ObjectId de GridFS
        });
    }

    async findAll() {
        return await ArchivoModel.find({ estado: true }).lean();
    }

    async findById(id) {
        if (!mongoose.Types.ObjectId.isValid(id)) return null;
        return await ArchivoModel.findOne({ _id: id, estado: true }).lean();
    }

    async findByNombreCoincidencia(coincidencia) {
        return await ArchivoModel.find({ nombre: coincidencia, estado: true }).lean();
    }

    async findByExtension(extension) {
        return await ArchivoModel.find({ tipo: extension, estado: true }).lean();
    }

    async findPapeleria() {
        return await ArchivoModel.find({ estado: false }).lean();
    }

    // --- MÉTODO PARA DESCARGAR/LEER DE GRIDFS ---
    async descargarDeGridFs(gridFsId) {
        const bucket = dbInstance.getBucket();
        const objectId = typeof gridFsId === 'string' ? new mongoose.Types.ObjectId(gridFsId) : gridFsId;
        return bucket.openDownloadStream(objectId);
    }

    async update(id, data, session = null) {
        if (!mongoose.Types.ObjectId.isValid(id)) return null;
        const options = session ? { session } : {};
        const result = await ArchivoModel.updateOne({ _id: id }, { $set: data }, options);
        return result.modifiedCount > 0;
    }

    async findByIdSinEstado(id) {
        if (!mongoose.Types.ObjectId.isValid(id)) return null;
        return await ArchivoModel.findById(id).lean();
    }

    async cambiarEstadoDeArchivo(id) {
        if (!mongoose.Types.ObjectId.isValid(id)) return null;
        const result = await ArchivoModel.updateOne(
            { _id: id },
            [{ $set: { estado: { $not: "$estado" } } }],
            { updatePipeline: true }
        );
        return result.modifiedCount > 0;
    }

    async eliminarPorId(id, session = null) {
        if (!mongoose.Types.ObjectId.isValid(id)) return null;
        const options = session ? { session } : {};
        const result = await ArchivoModel.deleteOne({ _id: id }, options);
        return result.deletedCount > 0;
    }

    // ----------------------------- Metodos que son llamadaos si ocurre un cambio desde una carpeta ---------------------------------
    async cambiarEstadoDescendientes(pathPadre, nuevoEstado, session) {
        return await ArchivoModel.updateMany(
            { path: { $regex: `^${pathPadre}` } },
            { $set: { estado: nuevoEstado } },
            { session }
        );
    }

    async actualizarPaths(pathAnterior, pathNueva, session) {
        return await ArchivoModel.updateMany(
            { path: { $regex: `^${pathAnterior}` } },
            [
                {
                    $set: {
                        path: {
                            $replaceOne: {
                                input: "$path",
                                find: pathAnterior,
                                replacement: pathNueva
                            }
                        }
                    }
                }
            ],
            { session, updatePipeline: true }
        );
    }

    async eliminarPorPath(path, session) {
        return await ArchivoModel.deleteMany(
            { path: { $regex: `^${path}` } },
            { session }
        );
    }

    async obtenerIdsGridFSPorPath(path, session) {
        const archivos = await ArchivoModel.find(
            { path: { $regex: `^${path}` } },
            { archivoGridFsId: 1 }
        ).session(session).lean();

        return archivos
            .map(archivo => archivo.archivoGridFsId)
            .filter(id => id != null);
    }

    // Método para eliminar archivos binarios de GridFS por sus IDs
    async eliminarBinariosGridFS(ids, session) {
        if (!ids || ids.length === 0) {
            return;
        }

        const db = dbInstance.getDb();
        // Eliminar los fragmentos binarios.
        await db.collection('archivos_fisicos.chunks').deleteMany(
            { files_id: { $in: ids } },
            { session }
        );

        // Eliminar los registros de archivos de GridFS.
        await db.collection('archivos_fisicos.files').deleteMany(
            { _id: { $in: ids } },
            { session }
        );
    }

    async agregarPermisoDescendientes(pathPadre, datosCompartido, session) {
        return await ArchivoModel.updateMany(
            { path: { $regex: `^${pathPadre}` } },
            { $push: { compartidoCon: datosCompartido } },
            { session }
        );
    }

    async removerPermisoDescendientes(pathPadre, usuarioId, session) {
        return await ArchivoModel.updateMany(
            { path: { $regex: `^${pathPadre}` } },
            { $pull: { compartidoCon: { usuarioId: usuarioId } } },
            { session }
        );
    }

}

module.exports = new ArchivoRepository();