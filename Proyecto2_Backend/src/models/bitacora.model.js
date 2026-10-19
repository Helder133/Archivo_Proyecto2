const mongoose = require('mongoose');
const { bitacoraEnum, moduloAfectado } = require('../models/enums.enum'); // Asegúrate de la ruta correcta

const bitacoraSchema = new mongoose.Schema(
    {
        usuarioId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Usuario',
            required: true
        },
        accion: {
            type: String,
            enum: Object.values(bitacoraEnum),
            required: true
        },
        recursoId: {
            type: mongoose.Schema.Types.ObjectId,
            default: null // Puede ser null para acciones como el LOGIN donde no hay un recurso afectado per se
        },
        moduloAfectado: {
            type: String,
            enum: Object.values(moduloAfectado),
            required: true
        },
        nombreHistorico: {
            type: String,
            required: true,
            trim: true
        },
        fecha: {
            type: Date,
            default: Date.now
        }
    },
    {
        collection: 'bitacora',
        versionKey: false
    }
);

const BitacoraModel = mongoose.model('bitacora', bitacoraSchema);

module.exports = BitacoraModel;