const jwt = require('jsonwebtoken');

const verificarToken = (req, res, next) => {
    // 1. Extraer el token del header "Authorization: Bearer <token>"
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; 

    if (!token) {
        return res.status(401).json({ error: 'Acceso denegado. Se requiere un token de autenticación.' });
    }

    try {
        // 2. Verificar que el token sea válido y no haya expirado
        const firmaSecreta = process.env.JWT_SECRET;
        const payload = jwt.verify(token, firmaSecreta);

        // 3. Inyectar el payload (que contiene el ID y el rol) en la petición
        req.usuario = payload; 
        
        // 4. Dar luz verde para que la petición pase al controlador
        next(); 
    } catch (error) {
        return res.status(403).json({ error: 'Token inválido o expirado. Inicia sesión nuevamente.' });
    }
};

module.exports = { verificarToken };