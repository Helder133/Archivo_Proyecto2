export interface ColumnaTabla {
    llave: string;
    titulo: string;
}

export interface ConfiguracionReporte {
    id: string;
    titulo: string;
    requiereFechas?: boolean;
    requiereUsuarioId?: boolean;
    columnas: ColumnaTabla[];
}