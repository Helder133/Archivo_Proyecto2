import { Archivo } from "./archivo.models";
import { Carpeta } from "./carpeta.models";

export interface CompartidoResponse {
    carpetas: Carpeta[];
    archivos: Archivo[];
}