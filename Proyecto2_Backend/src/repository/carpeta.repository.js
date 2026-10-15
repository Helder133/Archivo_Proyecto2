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

    async update(id, data, session = null) {
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
            { session }
        );
    }

    async toggleEstado(id) {
        if (!mongoose.Types.ObjectId.isValid(id)) return null;
        const result = await CarpetaModel.updateOne(
            { _id: id },
            [{ $set: { estado: { $not: "$estado" } } }]
        );
        return result.modifiedCount > 0;
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

    async compartirCarpeta(id, datosCompartir) {
        if (!mongoose.Types.ObjectId.isValid(id)) return null;
        const result = await CarpetaModel.updateOne(
            { _id: id },
            { $addToSet: { compartidoCon: { $each: datosCompartir } } }
        );
        return result.modifiedCount > 0;
    }

    async cambiarPermisoDeCompartido(id, usuarioId, nuevoPermiso) {
        if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(usuarioId)) return null;
        const result = await CarpetaModel.updateOne(
            { _id: id, "compartidoCon.usuarioId": usuarioId },
            { $set: { "compartidoCon.$.permiso": nuevoPermiso } }
        );
        return result.modifiedCount > 0;
    }

    async eliminarCompartido(id, usuarioId) {
        if (!mongoose.Types.ObjectId.isValid(id)) return null;
        const result = await CarpetaModel.updateOne(
            { _id: id },
            { $pull: { compartidoCon: { usuarioId: usuarioId } } }
        );
        return result.modifiedCount > 0;
    }
}

module.exports = new CarpetaRepository();