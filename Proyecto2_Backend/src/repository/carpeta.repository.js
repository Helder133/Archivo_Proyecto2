const mongoose = require('mongoose');
const CarpetaModel = require('../models/carpeta.model.js');

class CarpetaRepository {

    async existeNombreEnLaMismaPath(nombre, path) {
        const result = await CarpetaModel.exists({ nombre, path });
        return result !== null;
    }

    async create(carpeta) {
        const nuevaCarpeta = await CarpetaModel.create(carpeta);
        return nuevaCarpeta._id.toString();
    }

    async findById(id) {
        if (!mongoose.Types.ObjectId.isValid(id)) return null;
        return await CarpetaModel.findOne({ _id: id, estado: true }).lean();
    }

    async findByIdSinEstado(id) {
        if (!mongoose.Types.ObjectId.isValid(id)) return null;
        return await CarpetaModel.findById(id).lean();
    }

    async findByPath(path) {
        return await CarpetaModel.find({ path: path, estado: true }).lean();
    }

    async findPapeleria() {
        return await CarpetaModel.find({ estado: false }).lean();
    }

    async findByNombreAndPath(nombre, path) {
        return await CarpetaModel.findOne({ nombre: nombre, path: path, estado: true }).lean();
    }

    async update(id, data, session = null) {
        console.log('Actualizando carpeta con ID:', id, 'con datos:', data);
        if (!mongoose.Types.ObjectId.isValid(id)) return null;
        const options = session ? { session } : {}; // Inyectamos la sesión si existe
        const result = await CarpetaModel.updateOne({ _id: id }, { $set: data }, options);
        return result.modifiedCount > 0;
    }

    async actualizarPaths(pathAnterior, pathNueva, session) {
        return await CarpetaModel.updateMany(
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

    async actualizarEstado(id, nuevoEstado, session) {
        if (!mongoose.Types.ObjectId.isValid(id)) return null;
        const options = session ? { session } : {};
        const result = await CarpetaModel.updateOne(
            { _id: id },
            { $set: { estado: nuevoEstado } },
            options
        );
        return result.modifiedCount > 0;
    }

    async cambiarEstadoDescendientes(rutaPadre, nuevoEstado, session) {
        return await CarpetaModel.updateMany(
            { path: { $regex: `^${rutaPadre}` } },
            { $set: { estado: nuevoEstado } },
            { session }
        );
    }

    async eliminarPorPath(path, session) {
        return await CarpetaModel.deleteMany(
            {
                $or: [
                    {
                        $expr: {
                            $eq: [{ $concat: ["$path", "$nombre", "/"] }, path]
                        }
                    },
                    { path: { $regex: `^${path}` } }
                ]
            },
            { session }
        );
    }

    async validarCompartidoCon(carpetaId, usuarioId) {
        if (!mongoose.Types.ObjectId.isValid(carpetaId) || !mongoose.Types.ObjectId.isValid(usuarioId)) return false;

        const result = await CarpetaModel.exists({
            _id: carpetaId,
            "compartidoCon.usuarioId": usuarioId
        });
        return result !== null;
    }

    async compartirCarpeta(id, datosCompartir, session) {
        if (!mongoose.Types.ObjectId.isValid(id)) return null;
        const result = await CarpetaModel.updateOne(
            { _id: id },
            { $addToSet: { compartidoCon: { $each: datosCompartir } } },
            { session }
        );
        return result.modifiedCount > 0;
    }

    async cambiarPermisoDeCompartido(id, usuarioId, nuevoPermiso, session) {
        if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(usuarioId)) return null;
        const result = await CarpetaModel.updateOne(
            { _id: id, "compartidoCon.usuarioId": usuarioId },
            { $set: { "compartidoCon.$.permiso": nuevoPermiso } },
            { session }
        );
        return result.modifiedCount > 0;
    }

    async eliminarCompartido(id, usuarioId, session) {
        if (!mongoose.Types.ObjectId.isValid(id)) return null;
        const result = await CarpetaModel.updateOne(
            { _id: id },
            { $pull: { compartidoCon: { usuarioId: usuarioId } } },
            { session }
        );
        return result.modifiedCount > 0;
    }

    async agregarPermisoDescendientes(pathPadre, datosCompartir, session) {
        return await CarpetaModel.updateMany(
            { path: { $regex: `^${pathPadre}` } },
            { $push: { compartidoCon: datosCompartir } },
            { session }
        );
    }

    async removerPermisoDescendientes(pathPadre, usuarioId, session) {
        return await CarpetaModel.updateMany(
            { path: { $regex: `^${pathPadre}` } },
            { $pull: { compartidoCon: { usuarioId: usuarioId } } },
            { session }
        );
    }

}

module.exports = new CarpetaRepository();