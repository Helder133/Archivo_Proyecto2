const archivoRepository = require('../repository/archivo.repository');

class ArchivoService {
    async moverArchivos(pathAnterior, pathNueva, session) {
        return await archivoRepository.actualizarPaths(pathAnterior, pathNueva, session);
    }

    async eliminarArchivosPorPath(path, session) {
        // Primero, obtenemos los IDs de los archivos en GridFS que se van a eliminar
        const idsGridFS = await archivoRepository.obtenerIdsGridFSPorPath(path, session);

        // Luego, eliminamos los archivos binarios de GridFS
        await archivoRepository.eliminarBinariosGridFS(idsGridFS, session);

        // Finalmente, eliminamos los documentos de la colección de archivos
        return await archivoRepository.eliminarPorPath(path, session);
    }

    async agregarPermisoDescendientes(pathPadre, datosCompartido, session) {
        return await archivoRepository.agregarPermisoDescendientes(pathPadre, datosCompartido, session);
    }

    async removerPermisoDescendientes(pathPadre, usuarioId, session) {
        return await archivoRepository.removerPermisoDescendientes(pathPadre, usuarioId, session);
    }

}

module.exports = new ArchivoService();