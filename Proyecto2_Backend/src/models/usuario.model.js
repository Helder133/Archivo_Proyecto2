const { usuarioEnum } = require('./enums.enum.js');

class Usuario {
    constructor(datos = {}) {
        this.id = datos.id || null;
        this.nombre = datos.nombre || '';
        this.email = datos.email || '';
        this.password = datos.password || '';
        this.rol = datos.rol || usuarioEnum.USUARIO;
        this.estado = datos.estado !== undefined ? datos.estado : true;
    }
}

class Login {
    constructor(datos = {}) {
        this.email = datos.email || '';
        this.password = datos.password || '';
    }
}

module.exports = { Usuario, Login };