const dbInstance = require('../config/database.js');
const { ObjectId } = require('mongodb');
const carpetaCollectionName = 'carpeta';

class CarpetaDAO {

    async existeNombreEnLaMismaRuta(nombre, ruta) {
        const db = dbInstance.getDb();
        const result = await db.collection(carpetaCollectionName).findOne({ nombre: nombre, ruta: ruta });
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

    async findByRuta(ruta) {
        const db = dbInstance.getDb();
        return await db.collection(carpetaCollectionName).find({ ruta: ruta, estado: true }).toArray();
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

    async actualizarRutas(rutaAnterior, rutaNueva, session) {
        const db = dbInstance.getDb();
        return await db.collection(carpetaCollectionName).updateMany(
            {path: { $regex: `^${rutaAnterior}` }},
            [
                {
                    $set:{
                        path: {
                            $replaceOne: {
                                input: "$path",
                                find: rutaAnterior,
                                replacement: rutaNueva
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
        const result = await db.collection(carpetaCollectionName).updateOne({_id: new ObjectId(id) }, [{$set: { estado: {$not: "$estado"} }}]);
        return result.modifiedCount > 0;
    }

}

module.exports = new CarpetaDAO();