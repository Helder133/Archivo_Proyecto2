const mongoose = require('mongoose');
const { permisosEnum } = require('./enums.enum.js');

const compartidoSchema = new mongoose.Schema({
    usuarioId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'usuario',
        required: true
    },
    permiso: {
        type: String,
        enum: Object.values(permisosEnum),
        required: true
    }
}, {_id: false });

const carpetaSchema = new mongoose.Schema(
    {
        nombre: {
            type: String,
            required: true,
            trim: true
        },
        path: {
            type: String,
            required: true,
            default: '/'
        },
        usuarioId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'usuario',
            required: true
        },
        fechaCreacion: {
            type: Date,
            default: Date.now
        },
        estado: {
            type: Boolean,
            default: true
        },
        compartidoCon: {
            type: [compartidoSchema],
            default: []
        }
    },
    {
        collection: 'carpeta',
        versionKey: false,
    }
);

const CarpetaModel = mongoose.model('carpeta', carpetaSchema);

module.exports = CarpetaModel;