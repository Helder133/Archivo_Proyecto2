const bcrypt = require('bcrypt');
const usuarioDao = require('../daos/usuario.dao.js');

class UsuarioService {
    async createUsuario(usuario) {
        const email = usuario.email;
        const exists = await usuarioDao.existsByEmail(email);
        if (exists) {
            throw new Error('El email ya está registrado.');
        }
        const hashedPassword = await bcrypt.hash(usuario.password, 10);
        const newUsuario = ({
            nombre: usuario.nombre,
            email: usuario.email,
            password: hashedPassword,
            rol: usuario.rol || 'USUARIO',
            estado: true
        });
        const id = await usuarioDao.create(newUsuario);
        return id;
    }

    async updateUsuario(id, data) {
        const existingUser = await usuarioDao.existsByEmailExcludingId(data.email, id);
        if (existingUser) {
            throw new Error('El email ya está registrado.');
        }

        const newData = {
            nombre: data.nombre,
            email: data.email,
            rol: data.rol,
        };

        if (data.password && data.password.trim() !== '') {
            newData.password = await bcrypt.hash(data.password, 10);
        }

        const result = await usuarioDao.update(id, newData);
        if (!result) {
            throw new Error('No se pudo actualizar el usuario.');
        }
        return result;
    }

    async updateEstadoUsuario(id) {
        const usuario = await usuarioDao.findByIdSinEstado(id);
        if (!usuario) {
            throw new Error('Usuario no encontrado.');
        }
        return await usuarioDao.delete(id);
    }

    async getUsuarioByCoincidence(coincidence) {
        const usuarios = await usuarioDao.getUsuarioByCoincidence(coincidence);
        usuarios.forEach(usuario => {
            delete usuario.password;
        });
        return usuarios;
    }

    async getUsuarioById(id) {
        const usuario = await usuarioDao.findById(id);
        if (!usuario) {
            throw new Error('Usuario no encontrado.');
        }
        delete usuario.password;
        return usuario;
    }

    async getAllUsuarios() {
        const usuarios = await usuarioDao.findAll();
        usuarios.forEach(usuario => {
            delete usuario.password;
        });
        return usuarios;
    }

}

module.exports = new UsuarioService();