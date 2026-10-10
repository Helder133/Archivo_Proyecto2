const dbInstance = require('../config/database');
const { ObjectId } = require('mongodb');
const archivoCollectionName = 'archivo';

class ArchivoDAO {
    async actualizarRutas(rutaAnterior, rutaNueva, session) {
        const db = dbInstance.getDb();
        return await db.collection(archivoCollectionName).updateMany(
            { path: { $regex: `^${rutaAnterior}` } },
            [
                {
                    $set: {
                        path: {
                            $replaceOne: {
                                input: "$path",
                                find: rutaAnterior,
                                replacement: rutaNueva
                            }
                        }
                    }
                }
            ],
            { session }
        );
    }

    async eliminarPorRuta(ruta, session) {
        const db = dbInstance.getDb();
        return await db.collection(archivoCollectionName).deleteMany(
            {
                path: { $regex: `^${ruta}` }
            },
            { session }
        );
    }

    async obtenerIdsGridFSPorRuta(ruta, session) {
        const db = dbInstance.getDb();

        const archivos = await db.collection(archivoCollectionName).find(
            { path: { $regex: `^${ruta}` } },
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