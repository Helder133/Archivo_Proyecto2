class Usuario {
    constructor(datos = {}) {
        this.id = datos.id || null;
        this.nombre = datos.nombre || '';
        this.email = datos.email || '';
        this.password = datos.password || '';
    }
}