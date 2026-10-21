import { permisoEnum } from "./enums/enums.emun";

export interface PermisoCompartido {
    usuarioId: string;
    permiso: permisoEnum;
}

export interface Carpeta {
    _id: string;
    nombre: string;
    path: string;
    usuarioId: string;
    fechaCreacion: Date | string;
    estado: boolean;
    compartidoCon: PermisoCompartido[];
}