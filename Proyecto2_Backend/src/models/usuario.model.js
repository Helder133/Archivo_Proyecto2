const { usuarioEnum } = require('./enums.enum.js');
const mongoose = require('mongoose');

const usuarioSchema = new mongoose.Schema(
    {
        nombre: {
            type: String,
            required: true,
            trim: true
        },
        email: {
            type: String,
            required: true,
            trim: true,
            unique: true
        },
        password: {
            type: String,
            required: true
        },
        rol: {
            type: String,
            enum: Object.values(usuarioEnum),
            default: usuarioEnum.USUARIO
        },
        estado: {
            type: Boolean,
            default: true
        },
        limiteAlmacenamiento: {
            type: Number,
            default: 7168 //5368709120 5GB
        }


    },
    {
        collection: 'usuario',
        versionKey: false,
    }
)


const UsuarioModel = mongoose.model('usuario', usuarioSchema);

module.exports = UsuarioModel;