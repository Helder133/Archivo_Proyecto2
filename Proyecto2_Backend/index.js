const express = require('express');
const cors = require('cors'); // Permite solicitudes desde cualquier origen

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json()); // Permite analizar solicitudes JSON

// Ruta de ejemplo
app.get('/api/v1/', (req, res) => {
    res.send('¡Hola desde el servidor Express!');
});

// Iniciar el servidor
app.listen(port, () => {
    console.log(`Servidor escuchando en http://localhost:${port}`);
});