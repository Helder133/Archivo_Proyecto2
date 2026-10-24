const UsuarioModel = require('../models/usuario.model');
const ArchivoModel = require('../models/archivo.model');
const mongosee = require('mongoose');

class AlamcenamientoService {

    async obtenerEstadoAlmacenamiento(usuarioId) {
        const usuario = await UsuarioModel.findById(usuarioId).lean();
        if (!usuario) throw new Error('Usuario no encontrado');

        // 2. Sumamos el peso de sus archivos
        const result = await ArchivoModel.aggregate([
            { $match: { usuarioId: new mongosee.Types.ObjectId(usuarioId) } },
            { $group: { _id: null, totalUsado: { $sum: "$peso" } } } 
        ]);

        const usado = result.length > 0 ? result[0].totalUsado : 0;
        const limite = usuario.limiteAlmacenamiento || 7168;
        return {
            usado,
            limite: limite,
            porcentaje: ((usado / limite) * 100).toFixed(2),
            lleno: usado >= limite
        };
    }

    async actualizarLimiteGlobal(nuevoLimiteEnBytes) {
        // Esto actualiza el límite para TODOS los usuarios existentes en 1 milisegundo
        await UsuarioModel.updateMany({}, { $set: { limiteAlmacenamiento: nuevoLimiteEnBytes } });
        return true;
    }
    
}

module.exports = new AlamcenamientoService();