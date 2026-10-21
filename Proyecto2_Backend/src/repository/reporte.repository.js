const mongoose = require('mongoose');
const ArchivoModel = require('../models/archivo.model');
const CarpetaModel = require('../models/carpeta.model');
const BitacoraModel = require('../models/bitacora.model');
const { bitacoraEnum, moduloAfectado } = require('../models/enums.enum.js');

class ReporteRepository {

    // --- REPORTES DE ARCHIVOS Y ALMACENAMIENTO ---
    async cantidadArchivosPorTipo() {
        return await ArchivoModel.aggregate([
            { $match: { estado: true } },
            { $group: { _id: "$tipo", cantidad: { $sum: 1 } } },
            { $sort: { cantidad: -1 } }
        ]);
    }

    async archivosPorRangoFechas(inicio, fin) {
        return await ArchivoModel.find({
            estado: true,
            fechaCreacion: { $gte: new Date(inicio), $lte: new Date(fin) }
        }).lean();
    }

    async archivosConMasOperaciones() {
        return await BitacoraModel.aggregate([
            { $match: { moduloAfectado: moduloAfectado.ARCHIVO, recursoId: { $ne: null } } },
            { $group: { _id: "$recursoId", totalOperaciones: { $sum: 1 }, nombreArchivo: { $first: "$nombreHistorico" } } },
            { $sort: { totalOperaciones: -1 } },
            { $limit: 10 }
        ]);
    }

    // --- REPORTES DE USUARIOS ---
    async topUsuariosMasArchivos() {
        return await ArchivoModel.aggregate([
            { $match: { estado: true } },
            { $group: { _id: "$usuarioId", totalArchivos: { $sum: 1 } } },
            { $sort: { totalArchivos: -1 } },
            { $limit: 10 },
            { $lookup: { from: 'usuario', localField: '_id', foreignField: '_id', as: 'usuarioData' } },
            { $unwind: "$usuarioData" },
            { $project: { _id: 0, nombre: "$usuarioData.nombre", email: "$usuarioData.email", totalArchivos: 1 } }
        ]);
    }

    async usuariosMasRecursosCompartidos() {
        return await ArchivoModel.aggregate([
            { $match: { estado: true, "compartidoCon.0": { $exists: true } } },
            { $project: { usuarioId: 1 } },
            { $unionWith: { 
                coll: 'carpeta', 
                pipeline: [
                    { $match: { estado: true, "compartidoCon.0": { $exists: true } } }, 
                    { $project: { usuarioId: 1 } }
                ] 
            } },
            { $group: { _id: "$usuarioId", totalRecursosCompartidos: { $sum: 1 } } },
            { $sort: { totalRecursosCompartidos: -1 } },
            { $limit: 10 },
            { $lookup: { from: 'usuario', localField: '_id', foreignField: '_id', as: 'usuarioData' } },
            { $unwind: "$usuarioData" },
            { $project: { _id: 0, nombre: "$usuarioData.nombre", email: "$usuarioData.email", totalRecursosCompartidos: 1 } }
        ]);
    }

    // --- REPORTES DE COMPARTICIÓN ---
    async archivosCompartidosConMasUsuarios() {
        return await ArchivoModel.aggregate([
            { $match: { estado: true } },
            { $project: { nombre: 1, path: 1, tipo: 1, cantidadUsuarios: { $size: "$compartidoCon" } } },
            { $sort: { cantidadUsuarios: -1 } },
            { $limit: 10 }
        ]);
    }

    async recursosCompartidosPorUsuario(usuarioId) {
        const idObj = new mongoose.Types.ObjectId(usuarioId);
        const carpetas = await CarpetaModel.find({ usuarioId: idObj, "compartidoCon.0": { $exists: true }, estado: true }).lean();
        const archivos = await ArchivoModel.find({ usuarioId: idObj, "compartidoCon.0": { $exists: true }, estado: true }).lean();
        return { carpetas, archivos };
    }

    async recursosRecibidosPorUsuario(usuarioId) {
        const idObj = new mongoose.Types.ObjectId(usuarioId);
        const carpetas = await CarpetaModel.find({ "compartidoCon.usuarioId": idObj, estado: true }).lean();
        const archivos = await ArchivoModel.find({ "compartidoCon.usuarioId": idObj, estado: true }).lean();
        return { carpetas, archivos };
    }

    // --- REPORTES DE ACTIVIDAD ---
    async historialUsuarioFechas(usuarioId, inicio, fin) {
        return await BitacoraModel.find({
            usuarioId: new mongoose.Types.ObjectId(usuarioId),
            fecha: { $gte: new Date(inicio), $lte: new Date(fin) }
        }).sort({ fecha: -1 }).lean();
    }

    async operacionesPorTipo() {
        return await BitacoraModel.aggregate([
            { $group: { _id: "$accion", total: { $sum: 1 } } },
            { $sort: { total: -1 } }
        ]);
    }

    async operacionesPorPeriodo() {
        // Agrupa por año y mes (ej: "2026-04")
        return await BitacoraModel.aggregate([
            { $group: { _id: { $dateToString: { format: "%Y-%m", date: "$fecha" } }, total: { $sum: 1 } } },
            { $sort: { _id: 1 } }
        ]);
    }

    async principalesAccionesSistema() {
        // Muestra el top 5 de acciones más realizadas en todo el sistema
        return await BitacoraModel.aggregate([
            { $group: { _id: "$accion", total: { $sum: 1 } } },
            { $sort: { total: -1 } },
            { $limit: 5 }
        ]);
    }
}

module.exports = new ReporteRepository();