const reporteRepository = require('../repository/reporte.repository');
const bitacoraService = require('./bitacora.service');
const permisosService = require('./permisos.service');
const { bitacoraEnum, moduloAfectado } = require('../models/enums.enum.js');

class ReporteService {

    // --- ARCHIVOS ---
    async cantidadArchivosPorTipo(usuarioId) {
        await permisosService.verificarSiEsAdmin(usuarioId);
        await bitacoraService.registrarAccion(
            usuarioId,
            bitacoraEnum.CONSULTAR_REGISTROS,
            moduloAfectado.REPORTE,
            'Consulta de cantidad de archivos por tipo'
        );
        return await reporteRepository.cantidadArchivosPorTipo();
    }

    async archivosPorRangoFechas(inicio, fin, usuarioId) {
        if (!inicio || !fin) throw new Error('Las fechas de inicio y fin son requeridas.');
        await permisosService.verificarSiEsAdmin(usuarioId);
        await bitacoraService.registrarAccion(
            usuarioId,
            bitacoraEnum.CONSULTAR_REGISTROS,
            moduloAfectado.REPORTE,
            `Consulta de archivos por rango de fechas: ${inicio} a ${fin}`
        );
        return await reporteRepository.archivosPorRangoFechas(inicio, fin);
    }

    async archivosConMasOperaciones(usuarioId) {
        await permisosService.verificarSiEsAdmin(usuarioId);
        await bitacoraService.registrarAccion(
            usuarioId,
            bitacoraEnum.CONSULTAR_REGISTROS,
            moduloAfectado.REPORTE,
            'Consulta de archivos con más operaciones'
        );
        return await reporteRepository.archivosConMasOperaciones();
    }

    // --- USUARIOS ---
    async topUsuariosMasArchivos(usuarioId) {
        await permisosService.verificarSiEsAdmin(usuarioId);
        await bitacoraService.registrarAccion(
            usuarioId,
            bitacoraEnum.CONSULTAR_REGISTROS,
            moduloAfectado.REPORTE,
            'Consulta de top usuarios con más archivos'
        );
        return await reporteRepository.topUsuariosMasArchivos();
    }

    async usuariosMasRecursosCompartidos(usuarioId) {
        await permisosService.verificarSiEsAdmin(usuarioId);
        await bitacoraService.registrarAccion(
            usuarioId,
            bitacoraEnum.CONSULTAR_REGISTROS,
            moduloAfectado.REPORTE,
            'Consulta de usuarios con más recursos compartidos'
        );
        return await reporteRepository.usuariosMasRecursosCompartidos();
    }

    // --- COMPARTICIÓN ---
    async archivosCompartidosConMasUsuarios(usuarioId) {
        await permisosService.verificarSiEsAdmin(usuarioId);
        await bitacoraService.registrarAccion(
            usuarioId,
            bitacoraEnum.CONSULTAR_REGISTROS,
            moduloAfectado.REPORTE,
            'Consulta de archivos compartidos con más usuarios'
        );
        return await reporteRepository.archivosCompartidosConMasUsuarios();
    }

    async recursosCompartidosPorUsuario(usuarioId, usuarioIdToken) {
        if (!usuarioId) throw new Error('El ID del usuario es requerido.');
        await permisosService.verificarSiEsAdmin(usuarioIdToken);
        await bitacoraService.registrarAccion(
            usuarioIdToken,
            bitacoraEnum.CONSULTAR_REGISTROS,
            moduloAfectado.REPORTE,
            'Consulta de recursos compartidos por usuario'
        );
        return await reporteRepository.recursosCompartidosPorUsuario(usuarioId);
    }

    async recursosRecibidosPorUsuario(usuarioId, usuarioIdToken) {
        if (!usuarioId) throw new Error('El ID del usuario es requerido.');
        await permisosService.verificarSiEsAdmin(usuarioIdToken);
        await bitacoraService.registrarAccion(
            usuarioIdToken,
            bitacoraEnum.CONSULTAR_REGISTROS,
            moduloAfectado.REPORTE,
            'Consulta de recursos recibidos por usuario'
        );
        return await reporteRepository.recursosRecibidosPorUsuario(usuarioId);
    }

    // --- ACTIVIDAD ---
    async historialUsuarioFechas(usuarioId, inicio, fin, usuarioIdToken) {
        if (!usuarioId || !inicio || !fin) throw new Error('ID de usuario y fechas requeridas.');
        await permisosService.verificarSiEsAdmin(usuarioIdToken);
        await bitacoraService.registrarAccion(
            usuarioIdToken,
            bitacoraEnum.CONSULTAR_REGISTROS,
            moduloAfectado.REPORTE,
            `Consulta de historial de usuario por fechas: ${inicio} a ${fin}`
        );
        return await reporteRepository.historialUsuarioFechas(usuarioId, inicio, fin);
    }

    async operacionesPorTipo(usuarioId) {
        await permisosService.verificarSiEsAdmin(usuarioId);
        await bitacoraService.registrarAccion(
            usuarioId,
            bitacoraEnum.CONSULTAR_REGISTROS,
            moduloAfectado.REPORTE,
            'Consulta de operaciones por tipo'
        );
        return await reporteRepository.operacionesPorTipo();
    }

    async operacionesPorPeriodo(usuarioId) {
        await permisosService.verificarSiEsAdmin(usuarioId);
        await bitacoraService.registrarAccion(
            usuarioId,
            bitacoraEnum.CONSULTAR_REGISTROS,
            moduloAfectado.REPORTE,
            'Consulta de operaciones por periodo'
        );
        return await reporteRepository.operacionesPorPeriodo();
    }

    async principalesAccionesSistema(usuarioId) {
        await permisosService.verificarSiEsAdmin(usuarioId);
        await bitacoraService.registrarAccion(
            usuarioId,
            bitacoraEnum.CONSULTAR_REGISTROS,
            moduloAfectado.REPORTE,
            'Consulta de principales acciones del sistema'
        );
        return await reporteRepository.principalesAccionesSistema();
    }
}

module.exports = new ReporteService();