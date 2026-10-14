const dbInstance = require('../config/database');
const { ObjectId } = require('mongodb');
const archivoCollectionName = 'archivo';

class ArchivoDAO {
    async actualizarPaths(pathAnterior, pathNueva, session) {
        const db = dbInstance.getDb();
        return await db.collection(archivoCollectionName).updateMany(
            { path: { $regex: `^${pathAnterior}` } },
            [
                {
                    $set: {
                        path: {
                            $replaceOne: {
                                input: "$path",
                                find: pathAnterior,
                                replacement: pathNueva
                            }
                        }
                    }
                }
            ],
            { session }
        );
    }

    async eliminarPorPath(path, session) {
        const db = dbInstance.getDb();
        return await db.collection(archivoCollectionName).deleteMany(
            {
                path: { $regex: `^${path}` }
            },
            { session }
        );
    }

    async obtenerIdsGridFSPorPath(path, session) {
        const db = dbInstance.getDb();

        const archivos = await db.collection(archivoCollectionName).find(
            { path: { $regex: `^${path}` } },
            {
                projection: { archivoGridFsId: 1 },
                session
            }
        )
            .toArray();

        return archivos
            .map(archivo => archivo.archivoGridFsId)
            .filter(id => id != null);
    }

    // Método para eliminar archivos binarios de GridFS por sus IDs
    async eliminarBinariosGridFS(ids, session) {
        if (ids.length === 0) {
            return;
        }

        const db = dbInstance.getDb();

        // Eliminar los fragmentos binarios.
        await db.collection('fs.chunks').deleteMany(
            { files_id: { $in: ids } },
            { session }
        );

        // Eliminar los registros de archivos de GridFS.
        await db.collection('fs.files').deleteMany(
            { _id: { $in: ids } },
            { session }
        );
    }

}

module.exports = new ArchivoDAO();