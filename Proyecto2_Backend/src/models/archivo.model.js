const mongosee = require('mongoose');
const { permisosEnum, tipoArchivoEnum } = require('../models/enums.enum.js');

const compartidoSchema = new mongosee.Schema({
    usuarioId: {
        type: mongosee.Schema.Types.ObjectId,
        ref: 'usuario',
        required: true
    },
    permiso: {
        type: String,
        enum: Object.values(permisosEnum),
        required: true
    }
}, { _id: false });

const archivoSchema = new mongosee.Schema(
    {
        nombre: {
            type: String,
            required: true,
            trim: true
        },
        tipo: {
            type: String,
            enum: tipoArchivoEnum,
            required: true,
            trim: true
        },
        path: {
            type: String,
            required: true,
            default: '/',
        },
        usuarioId: {
            type: mongosee.Schema.Types.ObjectId,
            ref: 'usuario',
            required: true
        },
        archivoGridFsId: {
            type: mongosee.Schema.Types.ObjectId,
            required: true
        },
        fechaCreacion: {
            type: Date,
            default: Date.now
        },
        fechaModificacion: {
            type: Date,
            default: Date.now
        },
        compartidoCon: {
            type: [compartidoSchema],
            default: []
        },
        estado: {
            type: Boolean,
            default: true
        }
    },
    {
        collection: 'archivo',
        versionKey: false
    }
);

const ArchivoModel = mongosee.model('archivo', archivoSchema);

module.exports = ArchivoModel;