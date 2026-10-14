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
        }

    }, 
    {
        collection: 'usuario',
        versionKey: false,
    }
)

class Login {
    constructor(datos = {}) {
        this.email = datos.email || '';
        this.password = datos.password || '';
    }
}

const UsuarioModel = mongoose.model('Usuario', usuarioSchema);

module.exports = UsuarioModel;