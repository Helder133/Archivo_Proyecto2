const mongoose = require('mongoose');
const UsuarioModel = require('../models/usuario.model.js');

class UsuarioRepository {

    async login(email) {
        return await UsuarioModel.findOne({
            email,
            estado: true
        });
    }

    async existsByEmail(email) {
        const usuario = await UsuarioModel.exists({ email });
        return usuario !== null;
    }

    async existsByEmailExcludingId(email, id) {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return null;
        }

        const exists = await UsuarioModel.exists(
            {
                email,
                _id: { $ne: id }
            }
        );

        return exists !== null;
    }

    async create(usuario) {
        const nuevoUsuario = await UsuarioModel.create(usuario);
        return nuevoUsuario._id.toString();
    }

    async update(id, data) {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return null;
        }

        const resultado = await UsuarioModel.updateOne(
            { _id: id },
            { $set: data },
            { runValidators: true }
        );

        return resultado.matchedCount > 0;
    }

    async cambiarEstado(id) {
        if (!mongoose.Types.ObjectId.isValid(id)) return null;

        const resultado = await UsuarioModel.updateOne(
            { _id: id },
            [{ $set: { estado: { $not: "$estado" } } }]
        );

        return resultado.modifiedCount > 0;
    }

    async getUsuarioByCoincidence(coincidence) {
        return await UsuarioModel.find({
            $or: [
                { nombre: coincidence },
                { email: coincidence }
            ]
        }).select('-password').lean();
    }

    async findById(id) {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return null;
        }

        return await UsuarioModel.findOne({
            _id: id,
            estado: true
        }).select('-password').lean();
    }

    async findByIdSinEstado(id) {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return null;
        }

        return await UsuarioModel.findById(id).select('-password').lean();
    }

    async findAll() {
        return await UsuarioModel.find().select('-password').lean();
    }

}

module.exports = new UsuarioRepository();