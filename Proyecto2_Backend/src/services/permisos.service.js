const { permisosEnum, usuarioEnum } = require('../models/enums.enum');
const UsuarioRepository = require('../repository/usuario.repository');

class PermisosService {
    
    verificarPermiso(recurso, usuarioIdEjecutor, permisoRequerido, rolUsuario = usuarioEnum.USUARIO) {
        
        // 1. Acceso universal para el Administrador (opcional, dependiendo de tus reglas de negocio)
        if (rolUsuario === usuarioEnum.ADMIN) {
            return true;
        }

        // 2. El dueño original tiene acceso absoluto
        if (recurso.usuarioId.toString() === usuarioIdEjecutor.toString()) {
            return true;
        }

        // 3. Buscamos al usuario en la lista de invitados
        const invitado = recurso.compartidoCon.find(
            p => p.usuarioId.toString() === usuarioIdEjecutor.toString()
        );

        if (!invitado) {
            throw new Error('Acceso denegado. No tienes permisos para ver o modificar este recurso.');
        }

        // 4. Evaluamos la jerarquía de permisos
        if (permisoRequerido === permisosEnum.LECTURA) {
            // Para leer, basta con tener permiso de lectura O de edición
            if (invitado.permiso !== permisosEnum.LECTURA && invitado.permiso !== permisosEnum.EDITAR) {
                throw new Error('Acceso denegado. Requiere permisos de lectura.');
            }
        } 
        else if (permisoRequerido === permisosEnum.EDITAR) {
            // Para editar, SOLO el permiso de edición es válido
            if (invitado.permiso !== permisosEnum.EDITAR) {
                throw new Error('Acceso denegado. Requiere privilegios de edición para realizar esta acción.');
            }
        }
        else if (permisoRequerido === permisosEnum.COMENTAR) {
            if (invitado.permiso !== permisosEnum.COMENTAR && invitado.permiso !== permisosEnum.EDITAR) {
                throw new Error('Acceso denegado. Requiere privilegios para comentar.');
            }
        }

        return true;
    }

    async verificarSiEsAdmin(usuarioId) {
        const usuario = await UsuarioRepository.findById(usuarioId);
        if (!usuario) {
            throw new Error('Acceso denegado. Requiere privilegios de administrador.');
        }
        if (usuario.rol !== usuarioEnum.ADMIN) {
            throw new Error('Acceso denegado. Requiere privilegios de administrador.');
        }
    }
}

module.exports = new PermisosService();