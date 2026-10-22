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

    async create(usuario, session = null) {
        const options = session ? { session } : {};
        // Envolvemos 'usuario' en un arreglo para que Mongoose respete el objeto 'options'
        const result = await UsuarioModel.create([usuario], options);
        return result[0]._id.toString();
    }

    async update(id, data, session = null) {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return null;
        }
        const options = { runValidators: true };
        if (session) {
            options.session = session;
        }
        const resultado = await UsuarioModel.updateOne(
            { _id: id },
            { $set: data },
            options
        );

        return resultado.matchedCount > 0;
    }

    async cambiarEstado(id, session = null) {
        if (!mongoose.Types.ObjectId.isValid(id)) return null;

        const options = { updatePipeline: true };
        if (session) {
            options.session = session;
        }

        const resultado = await UsuarioModel.updateOne(
            { _id: id },
            [{ $set: { estado: { $not: "$estado" } } }],
            options
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

    async findUsuariosExcluyendoIds(idsExcluidos) {
        return await UsuarioModel.find({
            _id: { $nin: idsExcluidos },
            estado: true,
            rol: 'usuario'
        }).select('-password').lean();
    }

}

module.exports = new UsuarioRepository();