import { usuarioEnum } from "./enums/enums.emun";

export interface Usuario {
    _id?: string;
    nombre: string;
    email: string;
    password?: string;
    rol: usuarioEnum;
    estado?: boolean;
}

export interface LoginPayload {
    email: string;
    password: string;
}

export interface LoginResponse {
    mensaje: string;
    token: string;
    usuario: Usuario;
}