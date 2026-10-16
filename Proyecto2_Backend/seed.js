const dbInstance = require('./src/config/database');
const { permisosEnum } = require('./src/models/enums.enum.js');
const { ObjectId } = require('mongodb');
const { Readable } = require('stream');
const bcrypt = require('bcrypt'); // Importamos bcrypt

async function runSeed() {
    try {
        await dbInstance.connect();
        const db = dbInstance.getDb();
        const bucket = dbInstance.getBucket();

        await db.dropDatabase();
        console.log("Base de datos reiniciada.");

        const subirArchivoAGridFs = (nombre, contenido) => {
            return new Promise((resolve, reject) => {
                const uploadStream = bucket.openUploadStream(nombre);
                const readableStream = Readable.from([contenido]);

                readableStream.pipe(uploadStream)
                    .on('error', reject)
                    .on('finish', () => resolve(uploadStream.id));
            });
        };

        // --- ENCRIPTAR CONTRASEÑA ---
        console.log("Encriptando contraseñas...");
        const passwordPlana = "123";
        const passwordHash = await bcrypt.hash(passwordPlana, 10);

        // --- CREACIÓN DE 3 USUARIOS ---
        const idAdmin = new ObjectId();
        const idHelder = new ObjectId();
        const idAuxiliar = new ObjectId();

        const usuarios = [
            { _id: idAdmin, nombre: "Admin", email: "admin@gmail.com", password: passwordHash, rol: "admin", estado: true },
            { _id: idHelder, nombre: "Helder", email: "helder@gmail.com", password: passwordHash, rol: "usuario", estado: true },
            { _id: idAuxiliar, nombre: "Auxiliar", email: "auxiliar@gmail.com", password: passwordHash, rol: "usuario", estado: true }
        ];
        await db.collection('usuario').insertMany(usuarios);
        console.log("3 Usuarios creados con contraseñas seguras.");

        // --- CREACIÓN DE CARPETAS ---
        const carpetas = [
            { _id: new ObjectId(), nombre: "universidad", path: "/universidad/", usuarioId: idHelder, estado: true, compartidoCon: [], fechaCreacion: new Date() },
            { _id: new ObjectId(), nombre: "proyectos", path: "/universidad/proyectos/", usuarioId: idHelder, estado: true, compartidoCon: [], fechaCreacion: new Date() }
        ];
        await db.collection('carpeta').insertMany(carpetas);
        console.log("Carpetas base creadas.");

        // --- CREACIÓN DE 50 ARCHIVOS, COMPARTICIÓN Y PAPELERA ---
        const archivosAGuardar = [];
        const bitacoras = [];

        console.log("Generando 50 archivos (esto puede tomar un momento)...")
        for (let i = 1; i <= 50; i++) {
            const tipoArchivo = i % 2 === 0 ? '.md' : '.txt';
            const nombreArchivo = `documento_${i}${tipoArchivo}`;
            const contenidoDummy = `Contenido del archivo ${i}.`;

            const fileId = await subirArchivoAGridFs(nombreArchivo, contenidoDummy);

            let compartido = [];
            const permiso = i % 3 === 0 ? permisosEnum.LECTURA : permisosEnum.EDITAR;
            if (i <= 20) {
                compartido = [{ usuarioId: idAuxiliar, permiso: permiso }];
            }

            let estaActivo = true;
            if (i >= 45) {
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

        await db.collection('archivo').insertMany(archivosAGuardar);
        await db.collection('bitacora').insertMany(bitacoras);

        console.log("✅ Seed completado con éxito.");
        process.exit(0);

    } catch (error) {
        console.error("❌ Error en el seeder:", error);
        process.exit(1);
    }
}

runSeed();