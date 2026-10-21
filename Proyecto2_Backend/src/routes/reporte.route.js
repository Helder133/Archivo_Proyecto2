const express = require('express');
const router = express.Router();
const controllerReporte = require('../controllers/reporte.controller');
const { verificarToken } = require('../Middleware/auth.middleware');

// --- REPORTES DE ARCHIVOS ---
router.get('/reporte/archivos/tipo', verificarToken, controllerReporte.cantidadArchivosPorTipo);
router.get('/reporte/archivos/rango-fechas', verificarToken, controllerReporte.archivosPorRangoFechas);
router.get('/reporte/archivos/mas-operaciones', verificarToken, controllerReporte.archivosConMasOperaciones);

// --- REPORTES DE USUARIOS ---
router.get('/reporte/usuarios/top-archivos', verificarToken, controllerReporte.topUsuariosMasArchivos);
router.get('/reporte/usuarios/top-comparten', verificarToken, controllerReporte.usuariosMasRecursosCompartidos);

// --- REPORTES DE COMPARTICIÓN ---
router.get('/reporte/compartido/mas-usuarios', verificarToken, controllerReporte.archivosCompartidosConMasUsuarios);
router.get('/reporte/compartido/enviados/:usuarioId', verificarToken, controllerReporte.recursosCompartidosPorUsuario);
router.get('/reporte/compartido/recibidos/:usuarioId', verificarToken, controllerReporte.recursosRecibidosPorUsuario);

// --- REPORTES DE ACTIVIDAD ---
router.get('/reporte/actividad/usuario/:usuarioId/rango', verificarToken, controllerReporte.historialUsuarioFechas);
router.get('/reporte/actividad/operaciones-tipo', verificarToken, controllerReporte.operacionesPorTipo);
router.get('/reporte/actividad/operaciones-periodo', verificarToken, controllerReporte.operacionesPorPeriodo);
router.get('/reporte/actividad/principales', verificarToken, controllerReporte.principalesAccionesSistema);

module.exports = router;