const mongoose = require('mongoose');
const ArchivoModel = require('../models/archivo.model');
const dbInstance = require('../config/database');
const { Readable } = require('stream');

class ArchivoRepository {

    async existeNombreEnLaMismaPath(nombre, path) {
        const result = await ArchivoModel.exists({ nombre, path });
        return result !== null;
    }

    async create(archivo, session = null) {
        const options = session ? { session } : {};
        const result = await ArchivoModel.create([archivo], options);
        return result[0]._id.toString();
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

    async findAll(usuarioIdEjecutor) {
        return await ArchivoModel.find({
            estado: true,
            $or: [
                { usuarioId: usuarioIdEjecutor },
                { "compartidoCon.usuarioId": usuarioIdEjecutor }
            ]
        })
            .populate('compartidoCon.usuarioId', 'nombre email')
            .lean();
    }

    async findById(id) {
        if (!mongoose.Types.ObjectId.isValid(id)) return null;
        return await ArchivoModel.findOne({ _id: id, estado: true })
            .populate('compartidoCon.usuarioId', 'nombre email')
            .lean();
    }

    async findByNombreCoincidencia(coincidencia, usuarioIdEjecutor) {
        return await ArchivoModel.find({
            nombre: coincidencia,
            estado: true,
            $or: [
                { usuarioId: usuarioIdEjecutor },
                { "compartidoCon.usuarioId": usuarioIdEjecutor }
            ]
        })
            .populate('compartidoCon.usuarioId', 'nombre email')
            .lean();
    }

    async findByExtension(extension, usuarioIdEjecutor) {
        return await ArchivoModel.find({
            tipo: extension,
            estado: true,
            $or: [
                { usuarioId: usuarioIdEjecutor },
                { "compartidoCon.usuarioId": usuarioIdEjecutor }
            ]
        })
            .populate('compartidoCon.usuarioId', 'nombre email')
            .lean();
    }

    async findPapeleria(usuarioIdEjecutor) {
        return await ArchivoModel.find({
            estado: false,
            usuarioId: usuarioIdEjecutor
        }).lean();
    }

    async findByPath(path, usuarioIdEjecutor) {
        return await ArchivoModel.find({
            path: path,
            estado: true,
            $or: [
                { usuarioId: usuarioIdEjecutor },
                { "compartidoCon.usuarioId": usuarioIdEjecutor }
            ]
        })
            .populate('compartidoCon.usuarioId', 'nombre email')
            .lean();
    }

    async findPapeleraByPath(path, usuarioIdEjecutor) {
        return await ArchivoModel.find({
            path: path,
            estado: false,
            usuarioId: usuarioIdEjecutor
        }).lean();
    }

    async findCompartidosConUsuario(usuarioId) {
        return await ArchivoModel.find({
            "compartidoCon.usuarioId": usuarioId,
            estado: true
        })
            .populate('compartidoCon.usuarioId', 'nombre email')
            .lean();
    }

    async validarCompartidoCon(archivoId, usuarioId) {
        if (!mongoose.Types.ObjectId.isValid(archivoId) || !mongoose.Types.ObjectId.isValid(usuarioId)) return false;

        const result = await ArchivoModel.exists({
            _id: archivoId,
            "compartidoCon.usuarioId": usuarioId
        });
        return result !== null;
    }

    async compartirArchivo(id, datosCompartir, session = null) {
        if (!mongoose.Types.ObjectId.isValid(id)) return null;
        const options = session ? { session } : {};
        const result = await ArchivoModel.updateOne(
            { _id: id },
            { $push: { compartidoCon: { $each: datosCompartir } } },
            options
        );
        return result.modifiedCount > 0;
    }

    async cambiarPermisoDeCompartido(id, usuarioId, nuevoPermiso, session = null) {
        if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(usuarioId)) return null;
        const options = session ? { session } : {};
        const result = await ArchivoModel.updateOne(
            { _id: id, "compartidoCon.usuarioId": usuarioId },
            { $set: { "compartidoCon.$.permiso": nuevoPermiso } },
            options
        );
        return result.modifiedCount > 0;
    }

    async eliminarCompartido(id, usuarioId, session = null) {
        if (!mongoose.Types.ObjectId.isValid(id)) return null;
        const options = session ? { session } : {};
        const result = await ArchivoModel.updateOne(
            { _id: id },
            { $pull: { compartidoCon: { usuarioId: usuarioId } } },
            options
        );
        return result.modifiedCount > 0;
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

    async cambiarEstadoDeArchivo(id, session = null) {
        if (!mongoose.Types.ObjectId.isValid(id)) return null;

        // Unificamos todas las configuraciones en un solo objeto
        const options = { updatePipeline: true };
        if (session) {
            options.session = session;
        }

        const result = await ArchivoModel.updateOne(
            { _id: id },
            [{ $set: { estado: { $not: "$estado" } } }],
            options
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

    async actualizarPathIndividual(id, nuevoPath) {
        return await ArchivoModel.updateOne({ _id: id }, { $set: { path: nuevoPath } });
    }

    async actualizarPathsDescendencia(pathAnterior, pathNueva, session) {
        return await ArchivoModel.updateMany(
            { path: { $regex: `^${pathAnterior}` } },
            [{
                $set: {
                    path: {
                        $replaceOne: { input: "$path", find: pathAnterior, replacement: pathNueva }
                    }
                }
            }],
            { session, updatePipeline: true }
        );
    }

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