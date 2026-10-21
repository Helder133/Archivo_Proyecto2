import { permisoEnum, tipoArchivoEnum } from "./enums/enums.emun";

export interface PermisoCompartido {
    usuarioId: string;
    permiso: permisoEnum;
}

export interface Archivo {
    _id: string;
    nombre: string;
    tipo: tipoArchivoEnum;
    path: string;
    usuarioId: string;
    archivoGridFsId: string;
    fechaCreacion: Date | string;
    fechaModificacion: Date | string;
    estado: boolean;
    compartidoCon: PermisoCompartido[];
}