export interface Bitacora {
    _id: string;
    usuarioId: string;
    usuarioNombre: string;
    usuarioEmail: string;
    accion: string;
    moduloAfectado: string;
    nombreHistorico: string;
    recursoId?: string | null;
    fecha: Date | string;
}