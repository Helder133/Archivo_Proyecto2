const usuarioEnum = Object.freeze({
    ADMIN: 'admin',
    USUARIO: 'usuario'
});

const bitacoraEnum = Object.freeze({
    CREACION: 'creacion',
    MODIFICACION: 'modificacion',
    ELIMINACION: 'eliminacion',
    INICIO_SESION: 'inicio_sesion',
    CIERRE_SESION: 'cierre_sesion',
    COMPARTIR: 'compartir',
    DESCARGA: 'descarga',
    CAMBIO_PERMISO: 'cambio_permiso',
    CONSULTAR_REGISTROS: 'consultar_registros',
    RESTAURAR: 'restaurar'
});

const moduloAfectado = Object.freeze({
    ARCHIVO: 'archivo',
    CARPETA: 'carpeta',
    USUARIO: 'usuario',
    BITACORA: 'bitacora'
});

const permisosEnum = Object.freeze({
    LECTURA: 'lectura',
    EDITAR: 'editar',
    COMENTAR: 'comentar'
});

const tipoArchivoEnum = Object.freeze({
    TEXTO: '.txt',
    MARKDOWN: '.md',
});

module.exports = { usuarioEnum, bitacoraEnum, moduloAfectado, permisosEnum, tipoArchivoEnum };
