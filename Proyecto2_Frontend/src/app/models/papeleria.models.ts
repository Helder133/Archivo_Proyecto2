import { Archivo } from "./archivo.models";
import { Carpeta } from "./carpeta.models";

export interface PapeleraResponse {
    carpetas: Carpeta[];
    archivos: Archivo[];
}