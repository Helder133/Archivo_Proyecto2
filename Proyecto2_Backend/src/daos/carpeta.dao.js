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
        return await db.collection(carpetaCollectionName).findOne({ _id: new ObjectId(id) });
    }

    async findByRuta(ruta) {
        const db = dbInstance.getDb();
        return await db.collection(carpetaCollectionName).find({ ruta: ruta }).toArray();
    }

    async update(id, data) {
        const db = dbInstance.getDb();
        if (!ObjectId.isValid(id)) {
            return null;
        }
        const result = await db.collection(carpetaCollectionName).updateOne({ _id: new ObjectId(id) }, { $set: data });
        return result.modifiedCount > 0;
    }

    async delete(id) {
        const db = dbInstance.getDb();
        if (!ObjectId.isValid(id)) {
            return null;
        }
        const result = await db.collection(carpetaCollectionName).updateOne({_id: new ObjectId(id) }, [{$set: { estado: {$not: "$estado"} }}]);
        return result.modifiedCount > 0;
    }

}

module.exports = new CarpetaDAO();