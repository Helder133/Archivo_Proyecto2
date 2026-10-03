const { bitacoraEnum, tipoRecursoEnum } = require('./enums.enum');

class Bitacora {
    constructor(datos = {}) {
        this.id = datos.id || null;
        this.usuarioId = datos.usuarioId || null;
        this.accion = datos.accion || bitacoraEnum.CREACION;
        this.recursoId = datos.recursoId || null;
        this.tipoRecurso = datos.tipoRecurso || tipoRecursoEnum.ARCHIVO;
        this.nombreHistorico = datos.nombreHistorico || '';
        this.fecha = datos.fecha || new Date();
    }
}

module.exports = { Bitacora };