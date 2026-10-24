const carpetaRepository = require('../repository/carpeta.repository');
const archivoRepository = require('../repository/archivo.repository');
const bitacoraService = require('./bitacora.service');
const archivoService = require('./archivo.service');
const carpetaService = require('./carpeta.service');
const { bitacoraEnum, moduloAfectado } = require('../models/enums.enum.js');

class PapeleraService {

    async getPapelera(usuarioId) {
        const carpetas = await carpetaRepository.findPapeleria(usuarioId);
        const archivos = await archivoRepository.findPapeleria(usuarioId);

        const rutasCarpetasBorradas = carpetas.map(c => `${c.path}${c.nombre}/`);

        const carpetasRaices = carpetas.filter(carpeta => {
            const esHija = rutasCarpetasBorradas.some(rutaPadre => carpeta.path.startsWith(rutaPadre));
            return !esHija;
        });

        const archivosRaices = archivos.filter(archivo => {
            const esHijo = rutasCarpetasBorradas.some(rutaPadre => archivo.path.startsWith(rutaPadre));
            return !esHijo;
        });

        await bitacoraService.registrarAccion(
            usuarioId,
            bitacoraEnum.CONSULTAR_REGISTROS,
            moduloAfectado.PAPELERA, // O el módulo que prefieras
            'Consulta de vista Papelera',
            null
        );

        return {
            carpetas: carpetasRaices,
            archivos: archivosRaices
        };
    }

    async getPapeleriaArchivos(path, usuarioId) {
        return await archivoService.getArchivosByPathPapelera(path, usuarioId);
    }

    async getPapeleriaCarpetas(path, usuarioId) {
        return await carpetaService.findCarpetasByPathPapelera(path, usuarioId);
    }

}

module.exports = new PapeleraService();