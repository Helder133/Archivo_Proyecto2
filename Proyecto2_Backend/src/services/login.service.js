const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const usuarioRepository = require('../repository/usuario.repository.js');
const bitacoraService = require('./bitacora.service.js');
const { bitacoraEnum, moduloAfectado } = require('../models/enums.enum');


class LoginService {

    async login(login) {
        if (
            typeof login?.email !== 'string' ||
            typeof login?.password !== 'string'
        ) {
            throw new Error('Email y contraseña son requeridos.');
        }

        const email = login.email.trim();
        const password = login.password.trim();

        if (!email || !password) {
            throw new Error('Email y contraseña son requeridos.');
        }

        const usuario = await usuarioRepository.login(email);

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
        
        await bitacoraService.registrarAccion(usuario._id.toString(), bitacoraEnum.INICIO_SESION, moduloAfectado.USUARIO, usuario.nombre, usuario._id.toString());

        return {
            token,
            usuario: {
                _id: usuario._id.toString(),
                nombre: usuario.nombre,
                email: usuario.email,
                rol: usuario.rol,
                estado: usuario.estado
            }
        }
    }
}

module.exports = new LoginService();