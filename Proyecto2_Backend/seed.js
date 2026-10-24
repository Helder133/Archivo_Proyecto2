const mongoose = require('mongoose');
const dbInstance = require('./src/config/database');
const { permisosEnum } = require('./src/models/enums.enum.js');
const { Readable } = require('stream');
const bcrypt = require('bcrypt');
const UsuarioModel = require('./src/models/usuario.model');
const CarpetaModel = require('./src/models/carpeta.model');
const ArchivoModel = require('./src/models/archivo.model');

async function runSeed() {
    try {
        await dbInstance.connect();
        const db = dbInstance.getDb();
        const bucket = dbInstance.getBucket();

        await mongoose.connection.dropDatabase();
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
        const idAdmin = new mongoose.Types.ObjectId();
        const idHelder = new mongoose.Types.ObjectId();
        const idAuxiliar = new mongoose.Types.ObjectId();

        const usuarios = [
            { _id: idAdmin, nombre: "Admin", email: "admin@gmail.com", password: passwordHash, rol: "admin", estado: true, limiteAlmacenamiento: 7168 },
            { _id: idHelder, nombre: "Helder", email: "helder@gmail.com", password: passwordHash, rol: "usuario", estado: true, limiteAlmacenamiento: 7168 },
            { _id: idAuxiliar, nombre: "Auxiliar", email: "auxiliar@gmail.com", password: passwordHash, rol: "usuario", estado: true, limiteAlmacenamiento: 7168 }
        ];

        // Usando Mongoose
        await UsuarioModel.insertMany(usuarios);
        console.log("3 Usuarios creados con contraseñas seguras y límite de 5GB.");

        // --- CREACIÓN DE CARPETAS ---
        const carpetas = [
            { _id: new mongoose.Types.ObjectId(), nombre: "universidad", path: "/universidad/", usuarioId: idHelder, estado: true, compartidoCon: [], fechaCreacion: new Date() },
            { _id: new mongoose.Types.ObjectId(), nombre: "proyectos", path: "/universidad/proyectos/", usuarioId: idHelder, estado: true, compartidoCon: [], fechaCreacion: new Date() }
        ];

        await CarpetaModel.insertMany(carpetas);
        console.log("Carpetas base creadas.");

        // --- CREACIÓN DE 50 ARCHIVOS, COMPARTICIÓN Y PAPELERA ---
        const archivosAGuardar = [];
        const bitacoras = [];

        console.log("Generando 50 archivos (esto puede tomar un momento)...")
        for (let i = 1; i <= 50; i++) {
            const tipoArchivo = i % 2 === 0 ? '.md' : '.txt';
            const nombreArchivo = `documento_${i}${tipoArchivo}`;
            const contenidoDummy = `Contenido del archivo ${i}.`;

            // Calculamos el peso exacto en bytes del string dummy
            const pesoArchivo = Buffer.byteLength(contenidoDummy, 'utf8');

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
                _id: new mongoose.Types.ObjectId(),
                nombre: `documento_${i}`,
                tipo: tipoArchivo,
                path: i % 2 === 0 ? "/" : "/universidad/proyectos/",
                usuarioId: idHelder,
                archivoGridFsId: fileId,
                peso: pesoArchivo, // <-- Agregado para que el almacenamiento no sea 0
                fechaCreacion: new Date(),
                fechaModificacion: new Date(),
                compartidoCon: compartido,
                estado: estaActivo
            };
            archivosAGuardar.push(nuevoArchivo);

            bitacoras.push({
                _id: new mongoose.Types.ObjectId(),
                usuarioId: idHelder,
                accion: "creacion",
                recursoId: nuevoArchivo._id,
                tipoRecurso: "archivo",
                nombreHistorico: nuevoArchivo.nombre,
                fecha: new Date()
            });
        }

        await ArchivoModel.insertMany(archivosAGuardar);
        // Bitácora la dejamos con el driver nativo si no tienes un BitacoraModel configurado
        await db.collection('bitacora').insertMany(bitacoras);

        console.log("✅ Seed completado con éxito.");
        process.exit(0);

    } catch (error) {
        console.error("❌ Error en el seeder:", error);
        process.exit(1);
    }
}

runSeed();