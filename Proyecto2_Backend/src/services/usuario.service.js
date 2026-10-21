const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const usuarioRepository = require('../repository/usuario.repository.js');
const bitacoraService = require('./bitacora.service');
const { bitacoraEnum, moduloAfectado } = require('../models/enums.enum');

class UsuarioService {

    async createUsuario(usuario, usuarioId) {
        if (!usuario || !usuario.nombre?.trim() ||
            !usuario.email?.trim() || !usuario.password) {
            throw new Error(
                'Nombre, email y contraseña son requeridos.'
            );
        }

        const email = usuario.email.trim();

        const exists = await usuarioRepository.existsByEmail(email);

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

        const session = await mongoose.startSession();
        let idNuevoUsuario = null;

        try {
            await session.withTransaction(async () => {
                idNuevoUsuario = await usuarioRepository.create(newUsuario, session);

                await bitacoraService.registrarAccion(
                    usuarioId,
                    bitacoraEnum.CREACION,
                    moduloAfectado.USUARIO,
                    `Creación de usuario con correo: ${newUsuario.email}`,
                    idNuevoUsuario,
                    session
                );
            });

            return idNuevoUsuario;
        } catch (error) {
            console.error("Error transaccional al crear usuario:", error);
            throw new Error('Error al crear el usuario: ' + error.message);
        } finally {
            await session.endSession();
        }
    }

    async updateUsuario(id, data, usuarioId) {
        if (!data || !data.nombre?.trim() || !data.email?.trim()) {
            throw new Error('Nombre y email son requeridos.');
        }

        const email = data.email.trim();

        const existingUser = await usuarioRepository.existsByEmailExcludingId(email, id);

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

        const mongoose = require('mongoose');
        const session = await mongoose.startSession();

        try {
            await session.withTransaction(async () => {
                const result = await usuarioRepository.update(id, newData, session);
                if (result === null) {
                    throw new Error('El ID del usuario no es válido.');
                }
                if (!result) {
                    throw new Error('Usuario no encontrado.');
                }

                await bitacoraService.registrarAccion(
                    usuarioId,
                    bitacoraEnum.MODIFICACION,
                    moduloAfectado.USUARIO,
                    `Actualización de usuario: ${newData.email}`,
                    id,
                    session
                );
            });

            return true;
        } catch (error) {
            console.error("Error transaccional al actualizar usuario:", error);
            throw error;
        } finally {
            await session.endSession();
        }
    }

    async updateEstadoUsuario(id, usuarioId) {
        const usuario = await usuarioRepository.findByIdSinEstado(id);

        if (!usuario) {
            throw new Error('Usuario no encontrado.');
        }

        const accion = usuario.estado ? bitacoraEnum.ELIMINACION : bitacoraEnum.RESTAURACION;
        const session = await mongoose.startSession();

        try {
            await session.withTransaction(async () => {
                await usuarioRepository.cambiarEstado(id, session);

                await bitacoraService.registrarAccion(
                    usuarioId,
                    accion,
                    moduloAfectado.USUARIO,
                    `Cambio de estado del usuario: ${usuario.email}`,
                    id,
                    session
                );
            });

            return true;
        } catch (error) {
            console.error("Error transaccional al cambiar estado de usuario:", error);
            throw error;
        } finally {
            await session.endSession();
        }
    }

    async getUsuarioByCoincidence(coincidence, usuarioId) {
        const texto = coincidence.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // Escapar caracteres especiales
        const busqueda = new RegExp(texto, 'i');
        await bitacoraService.registrarAccion(usuarioId, bitacoraEnum.CONSULTAR_REGISTROS, moduloAfectado.USUARIO, `Consulta de usuarios por coincidencia: ${coincidence}`);
        return await usuarioRepository.getUsuarioByCoincidence(busqueda);
    }

    async getUsuarioById(id, usuarioId) {
        const usuario = await usuarioRepository.findById(id);

        if (!usuario) {
            throw new Error('Usuario no encontrado o inactivo.');
        }

        await bitacoraService.registrarAccion(usuarioId, bitacoraEnum.CONSULTAR_REGISTROS, moduloAfectado.USUARIO, `Consulta de usuario por ID: ${id}`);

        return usuario;
    }
    
    async getAllUsuarios(usuarioId) {
        await bitacoraService.registrarAccion(usuarioId, bitacoraEnum.CONSULTAR_REGISTROS, moduloAfectado.USUARIO, 'Consulta de todos los usuarios');
        return await usuarioRepository.findAll();
    }
}

module.exports = new UsuarioService();
