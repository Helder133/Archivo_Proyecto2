const dbInstance = require('../config/database.js');
const { ObjectId } = require('mongodb');
const usuarioCollectionName = 'usuario';

class UsuarioDAO {

    async login(email) {
        const db = dbInstance.getDb();
        return await db.collection(usuarioCollectionName).findOne({ email: email, estado: true });
    }

    async existsByEmail(email) {
        const db = dbInstance.getDb();
        const usuario = await db.collection(usuarioCollectionName).findOne({ email: email });
        return usuario !== null;
    }

    async existsByEmailExcludingId(email, id) {
        const db = dbInstance.getDb();
        if (!ObjectId.isValid(id)) {
            return null;
        }
        const usuario = await db.collection(usuarioCollectionName).findOne({ email: email, _id: { $ne: new ObjectId(id) } }, { projection: { _id: 1 } });
        return usuario;
    }

    async create(usuario) {
        const db = dbInstance.getDb();
        const result = await db.collection(usuarioCollectionName).insertOne(usuario);
        return result.insertedId;
    }

    async update(id, data) {
        const db = dbInstance.getDb();
        if (!ObjectId.isValid(id)) {
            return null;
        }
        const result = await db.collection(usuarioCollectionName).updateOne({ _id: new ObjectId(id) }, { $set: data });
        return result.modifiedCount > 0;
    }

    async delete(id) {
        const db = dbInstance.getDb();
        if (!ObjectId.isValid(id)) {
            return null;
        }
        const result = await db.collection(usuarioCollectionName).updateOne({ _id: new ObjectId(id) }, [{$set: { estado: {$not: "$estado"} }}]);
        return result.modifiedCount > 0;
    }

    async getUsuarioByCoincidence(coincidence) {
        const busqueda = new RegExp(coincidence, 'i');
        const db = dbInstance.getDb();
        return await db.collection(usuarioCollectionName).find({ $or: [{ nombre: busqueda }, { email: busqueda }] }).toArray();
    }

    async findById(id) {
        const db = dbInstance.getDb();
        if (!ObjectId.isValid(id)) {
            return null;
        }
        return await db.collection(usuarioCollectionName).findOne({ _id: new ObjectId(id), estado: true });
    }

    async findByIdSinEstado(id) {
        const db = dbInstance.getDb();
        if (!ObjectId.isValid(id)) {
            return null;
        }
        return await db.collection(usuarioCollectionName).findOne({ _id: new ObjectId(id) });
    }

    async findAll() {
        const db = dbInstance.getDb();
        return await db.collection(usuarioCollectionName).find().toArray();
    }

}

module.exports = new UsuarioDAO();