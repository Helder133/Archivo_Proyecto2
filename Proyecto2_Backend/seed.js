const dbInstance = require('./config/database');
const { ObjectId } = require('mongodb');
const { Readable } = require('stream');

async function runSeed() {
    try {
        // 1. Conectamos usando tu Singleton
        await dbInstance.connect();
        const db = dbInstance.getDb();
        const bucket = dbInstance.getBucket();

        await db.dropDatabase();
        console.log("Base de datos reiniciada.");

        // Función auxiliar para subir a GridFS
        const subirArchivoAGridFs = (nombre, contenido) => {
            return new Promise((resolve, reject) => {
                const uploadStream = bucket.openUploadStream(nombre);
                const readableStream = Readable.from([contenido]);

                readableStream.pipe(uploadStream)
                    .on('error', reject)
                    .on('finish', () => resolve(uploadStream.id));
            });
        };

        // --- CREACIÓN DE 3 USUARIOS ---
        const idAdmin = new ObjectId();
        const idHelder = new ObjectId();
        const idAuxiliar = new ObjectId();

        const usuarios = [
            { _id: idAdmin, nombre: "Admin", email: "admin@cunoc.edu.gt", password: "123", rol: "admin", estado: true },
            { _id: idHelder, nombre: "Helder", email: "helder@cunoc.edu.gt", password: "123", rol: "usuario", estado: true },
            { _id: idAuxiliar, nombre: "Auxiliar", email: "auxiliar@cunoc.edu.gt", password: "123", rol: "usuario", estado: true }
        ];
        await db.collection('usuarios').insertMany(usuarios);

        // --- CREACIÓN DE CARPETAS ---
        const carpetas = [
            { _id: new ObjectId(), nombre: "universidad", path: "/universidad/", usuarioId: idHelder, estado: true, compartidoCon: [], fechaCreacion: new Date() },
            { _id: new ObjectId(), nombre: "proyectos", path: "/universidad/proyectos/", usuarioId: idHelder, estado: true, compartidoCon: [], fechaCreacion: new Date() }
        ];
        await db.collection('carpetas').insertMany(carpetas);

        // --- CREACIÓN DE 50 ARCHIVOS, COMPARTICIÓN Y PAPELERA ---
        const archivosAGuardar = [];
        const bitacoras = [];

        console.log("Generando 50 archivos...");
        for (let i = 1; i <= 50; i++) {
            const tipoArchivo = i % 2 === 0 ? '.md' : '.txt';
            const nombreArchivo = `documento_${i}${tipoArchivo}`;
            const contenidoDummy = `Contenido del archivo ${i}.`;

            const fileId = await subirArchivoAGridFs(nombreArchivo, contenidoDummy);

            // Lógica para cumplir requerimientos
            let compartido = [];
            if (i <= 20) {
                // Los primeros 20 archivos se comparten con el Auxiliar
                compartido = [{ usuarioId: idAuxiliar, permiso: "lectura" }];
            }

            let estaActivo = true;
            if (i >= 45) {
                // Los últimos 5 archivos se mandan a la papelera
                estaActivo = false;
            }

            const nuevoArchivo = {
                _id: new ObjectId(),
                nombre: `documento_${i}`,
                tipo: tipoArchivo,
                path: i % 2 === 0 ? "/" : "/universidad/proyectos/",
                usuarioId: idHelder,
                archivoGridFsId: fileId,
                fechaCreacion: new Date(),
                fechaModificacion: new Date(),
                compartidoCon: compartido,
                estado: estaActivo
            };
            archivosAGuardar.push(nuevoArchivo);

            bitacoras.push({
                _id: new ObjectId(),
                usuarioId: idHelder,
                accion: "creacion",
                recursoId: nuevoArchivo._id,
                tipoRecurso: "archivo",
                nombreHistorico: nuevoArchivo.nombre,
                fecha: new Date()
            });
        }

        await db.collection('archivos').insertMany(archivosAGuardar);
        await db.collection('bitacora').insertMany(bitacoras);

        console.log("✅ Seed completado con éxito.");
        process.exit(0); // Cierra el proceso de Node.js al terminar

    } catch (error) {
        console.error("❌ Error en el seeder:", error);
        process.exit(1);
    }
}

runSeed();