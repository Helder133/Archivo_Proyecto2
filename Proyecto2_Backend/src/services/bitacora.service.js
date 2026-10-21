const bitacoraRepository = require('../repository/bitacora.repository');
const permisosService = require('./permisos.service');
const { bitacoraEnum, moduloAfectado } = require('../models/enums.enum.js');

class BitacoraService {
    
    async registrarAccion(usuarioId, accion, moduloAfectado, nombreHistorico, recursoId = null, session = null) {
        if (!usuarioId || !accion || !moduloAfectado) {
            throw new Error('Faltan datos obligatorios para registrar en la bitácora.');
        }

        const nuevaBitacora = {
            usuarioId,
            accion,
            moduloAfectado,
            nombreHistorico,
            recursoId
        };

        return await bitacoraRepository.create(nuevaBitacora, session);
    }

    async obtenerHistorialCompleto(usuarioId) {
        await permisosService.verificarSiEsAdmin(usuarioId);
        this.registrarAccion(usuarioId, bitacoraEnum.CONSULTAR_REGISTROS, moduloAfectado.BITACORA, 'Consulta de historial completo de la bitácora');
        return await bitacoraRepository.findAll();
    }
}

module.exports = new BitacoraService();