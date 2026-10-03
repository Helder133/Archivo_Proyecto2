class Carpeta {
    constructor(datos = {}) {
        this.id = datos.id || null;
        this.nombre = datos.nombre || '';
        this.path = datos.path || '/';
        this.usuarioId = datos.usuarioId || null;
        this.fechaCreacion = datos.fechaCreacion || new Date();
        this.estado = datos.estado || true;
        this.compartidoCon = datos.compartidoCon || [];
    }
}

module.exports = { Carpeta };