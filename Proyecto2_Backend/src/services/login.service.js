const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const usuarioDAO = require('../repository/usuario.repository.js');

class LoginService {

    async login(login) {
        const email = login?.email;
        const password = login?.password;

        if (!email || !password) {
            throw new Error('Email y contraseña son requeridos.');
        }

        const usuario = await usuarioDAO.login(email);

        if (!usuario) {
            throw new Error('Usuario no encontrado o inactivo.');
        }

        const isValid = await bcrypt.compare(password, usuario.password);
        if (!isValid) {
            throw new Error('Contraseña incorrecta.');
        }

        const payload = {
            id: usuario._id.toString(),
            rol: usuario.rol
        }

        const firmaSecreta = process.env.JWT_SECRET;
        const token = jwt.sign(payload, firmaSecreta, { expiresIn: '24h' });

        return {
            token,
            usuario: {
                id: usuario._id.toString,
                nombre: usuario.nombre,
                email: usuario.email,
                rol: usuario.rol,
                estado: usuario.estado
            }
        }
    }
}

module.exports = new LoginService();