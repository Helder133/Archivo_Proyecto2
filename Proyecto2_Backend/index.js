const express = require('express');
const cors = require('cors'); // Permite solicitudes desde cualquier origen
const dbInstance = require('./src/config/database')

const app = express();
const port = 3000;

const router = require('./src/routes/routes.route');

app.use(cors());
app.use(express.json()); // Permite analizar solicitudes JSON

app.use('/api/v1/', router);

async function iniciarServidor() {
    try {
        await dbInstance.connect();

        app.listen(port, () => {
            console.log(`Servidor escuchando en http://localhost:${port}`);
        });
    } catch (error) {
        console.error("Fallo crítico al iniciar la aplicación:", error);
        process.exit(1);
    }
}

iniciarServidor();