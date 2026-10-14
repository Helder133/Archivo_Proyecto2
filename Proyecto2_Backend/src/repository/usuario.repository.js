const mongoose = require('mongoose');
const UsuarioModel = require('../models/usuario.model.js');

class UsuarioRepository {

    async login(email) {
        return await UsuarioModel.findOne({
            email,
            estado: true
        }).select('+password');
    }

    async existsByEmail(email) {
        const usuario = await UsuarioModel.exists({ email });
        return usuario !== null;
    }

    async existsByEmailExcludingId(email, id) {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return null;
        }

        return await UsuarioModel.findOne({
            email,
            _id: { $ne: id }
        }).select('_id').lean();
    }

    async create(usuario) {
        const nuevoUsuario = await UsuarioModel.create(usuario);
        return nuevoUsuario._id;
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

        return resultado.modifiedCount > 0;
    }

    async delete(id) {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return null;
        }

        const usuario = await UsuarioModel.findById(id);

        if (!usuario) {
            return false;
        }

        usuario.estado = !usuario.estado;
        await usuario.save();

        return true;
    }

    async getUsuarioByCoincidence(coincidence) {
        const busqueda = new RegExp(coincidence, 'i');

        return await UsuarioModel.find({
            $or: [
                { nombre: busqueda },
                { email: busqueda }
            ]
        }).lean();
    }

    async findById(id) {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return null;
        }

        return await UsuarioModel.findOne({
            _id: id,
            estado: true
        }).lean();
    }

    async findByIdSinEstado(id) {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return null;
        }

        return await UsuarioModel.findById(id).lean();
    }

    async findAll() {
        return await UsuarioModel.find().lean();
    }

}

module.exports = new UsuarioRepository();