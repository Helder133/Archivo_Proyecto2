
const bcrypt = require('bcrypt');
const usuarioDao = require('../repository/usuario.repository.js');

class UsuarioService {

    async createUsuario(usuario) {
        if (!usuario || !usuario.nombre?.trim() ||
            !usuario.email?.trim() || !usuario.password) {
            throw new Error(
                'Nombre, email y contraseña son requeridos.'
            );
        }

        const email = usuario.email.trim();

        const exists = await usuarioDao.existsByEmail(email);

        if (exists) {
            throw new Error('El email ya está registrado.');
        }

        const hashedPassword = await bcrypt.hash(usuario.password.trim(), 10);

        const newUsuario = {
            nombre: usuario.nombre.trim(),
            email,
            password: hashedPassword,
            rol: usuario.rol || 'usuario',
            estado: true
        };

        return await usuarioDao.create(newUsuario);
    }

    async updateUsuario(id, data) {
        if (!data || !data.nombre?.trim() || !data.email?.trim()) {
            throw new Error('Nombre y email son requeridos.');
        }

        const email = data.email.trim();

        const existingUser = await usuarioDao.existsByEmailExcludingId(email, id);

        if (existingUser) {
            throw new Error('El email ya está registrado.');
        }

        const newData = {
            nombre: data.nombre.trim(),
            email
        };

        if (data.rol !== undefined && data.rol?.trim() !== '') {
            newData.rol = data.rol;
        }

        // Solo cambiar la contraseña si se envió una nueva
        if (typeof data.password === 'string' && data.password.trim() !== '') {
            newData.password = await bcrypt.hash(data.password.trim(), 10);
        }

        const result = await usuarioDao.update(id, newData);

        if (result === null) {
            throw new Error('El ID del usuario no es válido.');
        }

        if (!result) {
            throw new Error('Usuario no encontrado.');
        }

        return true;
    }

    async updateEstadoUsuario(id) {
        const usuario = await usuarioDao.findByIdSinEstado(id);

        if (!usuario) {
            throw new Error('Usuario no encontrado.');
        }

        return await usuarioDao.cambiarEstado(id);
    }

    async getUsuarioByCoincidence(coincidence) {
        const texto = coincidence.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // Escapar caracteres especiales
        const busqueda = new RegExp(texto, 'i');
        return await usuarioDao.getUsuarioByCoincidence(busqueda);
    }

    async getUsuarioById(id) {
        const usuario = await usuarioDao.findById(id);

        if (!usuario) {
            throw new Error('Usuario no encontrado o inactivo.');
        }

        return usuario;
    }

    async getAllUsuarios() {
        return await usuarioDao.findAll();
    }
}

module.exports = new UsuarioService();
