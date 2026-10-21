const carpetaRepository = require('../repository/carpeta.repository');
const archivoRepository = require('../repository/archivo.repository');
const bitacoraService = require('./bitacora.service');
const { bitacoraEnum, moduloAfectado } = require('../models/enums.enum.js');

class CompartidoService {
    
    async getCompartidosConmigo(usuarioId) {
        const carpetas = await carpetaRepository.findCompartidosConUsuario(usuarioId);
        const archivos = await archivoRepository.findCompartidosConUsuario(usuarioId);

        const rutasCarpetasCompartidas = carpetas.map(c => `${c.path}${c.nombre}/`);

        const carpetasRaices = carpetas.filter(carpeta => {
            const esHija = rutasCarpetasCompartidas.some(rutaPadre => carpeta.path.startsWith(rutaPadre));
            return !esHija; 
        });

        const archivosRaices = archivos.filter(archivo => {
            const esHijo = rutasCarpetasCompartidas.some(rutaPadre => archivo.path.startsWith(rutaPadre));
            return !esHijo;
        });

        await bitacoraService.registrarAccion(
            usuarioId, 
            bitacoraEnum.CONSULTAR_REGISTROS, 
            moduloAfectado.COMPARTIDO, 
            'Consulta de vista Compartidos Conmigo', 
            null
        );

        return {
            carpetas: carpetasRaices,
            archivos: archivosRaices
        };
    }
}

module.exports = new CompartidoService();