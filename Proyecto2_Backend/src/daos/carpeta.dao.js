const dbInstance = require('../config/database.js');
const { ObjectId } = require('mongodb');
const carpetaCollectionName = 'carpeta';

class CarpetaDAO {

    async existeNombreEnLaMismaPath(nombre, path) {
        const db = dbInstance.getDb();
        const result = await db.collection(carpetaCollectionName).findOne({ nombre: nombre, path: path });
        return !!result;
    }

    async create(carpeta) {
        const db = dbInstance.getDb();
        const result = await db.collection(carpetaCollectionName).insertOne(carpeta);
        return result.insertedId;
    }

    async findById(id) {
        const db = dbInstance.getDb();
        if (!ObjectId.isValid(id)) {
            return null;
        }
        return await db.collection(carpetaCollectionName).findOne({ _id: new ObjectId(id), estado: true });
    }

    async findByIdSinEstado(id) {
        const db = dbInstance.getDb();
        if (!ObjectId.isValid(id)) {
            return null;
        }
        return await db.collection(carpetaCollectionName).findOne({ _id: new ObjectId(id) });
    }

    async findByPath(path) {
        const db = dbInstance.getDb();
        return await db.collection(carpetaCollectionName).find({ path: path, estado: true }).toArray();
    }

    async findPapeleria() {
        const db = dbInstance.getDb();
        return await db.collection(carpetaCollectionName).find({ estado: false }).toArray();
    }

    async update(id, data) {
        const db = dbInstance.getDb();
        if (!ObjectId.isValid(id)) {
            return null;
        }
        const result = await db.collection(carpetaCollectionName).updateOne({ _id: new ObjectId(id) }, { $set: data });
        return result.modifiedCount > 0;
    }

    async actualizarPaths(pathAnterior, pathNueva, session) {
        const db = dbInstance.getDb();
        return await db.collection(carpetaCollectionName).updateMany(
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
        const db = dbInstance.getDb();
        if (!ObjectId.isValid(id)) {
            return null;
        }
        const result = await db.collection(carpetaCollectionName).updateOne({ _id: new ObjectId(id) }, [{ $set: { estado: { $not: "$estado" } } }]);
        return result.modifiedCount > 0;
    }

    async eliminarPorPath(path, session) {
        const db = dbInstance.getDb();
        return await db.collection(carpetaCollectionName).deleteMany(
            {
                $or: [
                    {
                        $expr: {
                            $eq: [
                                {
                                    $concat: ["$path", "$nombre", "/"]
                                },
                                path
                            ]
                        }
                    },
                    {
                        path: { $regex: `^${path}` }
                    }
                ]
            },
            { session }
        );
    }

    async validarCompartidoCon(carpetaId, usuarioId) {
        const db = dbInstance.getDb();
        if (!ObjectId.isValid(carpetaId) || !ObjectId.isValid(usuarioId)) {
            return false;
        }

        const carpeta = await db.collection(carpetaCollectionName).findOne({
            _id: new ObjectId(carpetaId),
            "compartidoCon.usuarioId": new ObjectId(usuarioId)
        });

        return !!carpeta;
    }

    async compartirCarpeta(id, datosCompartir) {
        const db = dbInstance.getDb();
        if (!ObjectId.isValid(id)) {
            return null;
        }

        const result = await db.collection(carpetaCollectionName).updateOne(
            { _id: new ObjectId(id) },
            { $addToSet: { compartidoCon: { $each: datosCompartir } } }
        );

        return result.modifiedCount > 0;
    }

    async cambiarPermisoDeCompartido(id, usuarioId, nuevoPermiso) {
        const db = dbInstance.getDb();
        if (!ObjectId.isValid(id) || !ObjectId.isValid(usuarioId)) {
            return null;
        }

        const result = await db.collection(carpetaCollectionName).updateOne(
            {
                _id: new ObjectId(id),
                "compartidoCon.usuarioId": new ObjectId(usuarioId)
            },
            {
                $set: {
                    "compartidoCon.$.permiso": nuevoPermiso
                }
            }
        );

        return result.modifiedCount > 0;
    }

    async eliminarCompartido(id, usuarioId) {
        const db = dbInstance.getDb();
        if (!ObjectId.isValid(id)) {
            return null;
        }

        const result = await db.collection(carpetaCollectionName).updateOne(
            { _id: new ObjectId(id) },
            { $pull: { compartidoCon: { usuarioId: new ObjectId(usuarioId) } } }
        );

        return result.modifiedCount > 0;
    }

}

module.exports = new CarpetaDAO();