const archivoDao = require('../repository/archivo.repository');

class ArchivoService {
    async moverArchivos(pathAnterior, pathNueva, session) {
        return await archivoDao.actualizarPaths(pathAnterior, pathNueva, session);
    }

    async eliminarArchivosPorPath(path, session) {
        // Primero, obtenemos los IDs de los archivos en GridFS que se van a eliminar
        const idsGridFS = await archivoDao.obtenerIdsGridFSPorPath(path, session);

        // Luego, eliminamos los archivos binarios de GridFS
        await archivoDao.eliminarBinariosGridFS(idsGridFS, session);

        // Finalmente, eliminamos los documentos de la colección de archivos
        return await archivoDao.eliminarPorPath(path, session);
    }
}

module.exports = new ArchivoService();