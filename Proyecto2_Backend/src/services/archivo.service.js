const archivoDao = require('../daos/archivo.dao');

class ArchivoService {
    async moverArchivos(rutaAnterior, rutaNueva, session) {
        return await archivoDao.actualizarRutas(rutaAnterior, rutaNueva, session);
    }

    async eliminarArchivosPorRuta(ruta, session) {
        // Primero, obtenemos los IDs de los archivos en GridFS que se van a eliminar
        const idsGridFS = await archivoDao.obtenerIdsGridFSPorRuta(ruta, session);

        // Luego, eliminamos los archivos binarios de GridFS
        await archivoDao.eliminarBinariosGridFS(idsGridFS, session);

        // Finalmente, eliminamos los documentos de la colección de archivos
        return await archivoDao.eliminarPorRuta(ruta, session);
    }
}

module.exports = new ArchivoService();