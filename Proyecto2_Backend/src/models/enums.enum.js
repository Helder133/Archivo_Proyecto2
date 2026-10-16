const usuarioEnum = Object.freeze({
    ADMIN: 'admin',
    USUARIO: 'usuario'
});

const bitacoraEnum = Object.freeze({
    CREACION: 'creacion',
    MODIFICACION: 'modificacion',
    ELIMINACION: 'eliminacion',
    INICIO_SESION: 'inicio_sesion'
});

const tipoRecursoEnum = Object.freeze({
    ARCHIVO: 'archivo',
    CARPETA: 'carpeta'
});

const permisosEnum = Object.freeze({
    LECTURA: 'lectura',
    EDITAR: 'editar',
    COMENTAR: 'comentar'
});

module.exports = { usuarioEnum, bitacoraEnum, tipoRecursoEnum, permisosEnum };
