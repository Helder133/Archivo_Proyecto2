class Archivo {
    constructor(datos = {}) {
        this.id = datos.id || null;
        this.nombre = datos.nombre || '';
        this.tipo = datos.tipo || '';
        this.path = datos.path || '';
        this.usuarioId = datos.usuarioId || null;
        this.archivoGridFsId = datos.archivoGridFsId || null;
        this.fechaCreacion = datos.fechaCreacion || new Date();
        this.fechaModificacion = datos.fechaModificacion || null;
        this.compartidoCon = datos.compartidoCon || [];
        this.estado = datos.estado || true;
    }
}

module.exports = { Archivo };