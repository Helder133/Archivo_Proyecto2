import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ReporteTablaComponent } from '../../components/reportes/reporte-tabla/reporte-tabla.component';
import { ReporteService } from '../../services/report/reporte.service';
import { UsuarioService } from '../../services/usuario/usuario.service';
import { Usuario } from '../../models/usuario.model';
import { ConfiguracionReporte } from '../../models/reporte.model';

@Component({
  selector: 'app-reportes.component',
  imports: [FormsModule, ReporteTablaComponent],
  templateUrl: './reportes.component.html'
})
export class ReportesComponent {
  private reporteService = inject(ReporteService);
  private usuarioService = inject(UsuarioService);

  // Estados
  datosReporte = signal<any[]>([]);
  cargando = signal<boolean>(false);
  error = signal<string | null>(null);

  // Opciones precargadas para los filtros
  usuariosList = signal<Usuario[]>([]);
  usuarioSeleccionado = signal<string>('');
  fechaInicio = signal<string>('');
  fechaFin = signal<string>('');

  // Menú de Reportes (Ejemplo con 4 principales, puedes agregar los demás siguiendo la misma estructura)
  listaReportes: ConfiguracionReporte[] = [
    // Reportes de Archivos
    {
      id: 'archivos_tipo',
      titulo: 'Cantidad de Archivos por Tipo',
      columnas: [{ llave: '_id', titulo: 'Extensión' }, { llave: 'cantidad', titulo: 'Total' }]
    },
    {
      id: 'archivos_rango',
      titulo: 'Archivos por Rango de Fechas',
      requiereFechas: true,
      columnas: [{ llave: 'nombre', titulo: 'Nombre' }, { llave: 'tipo', titulo: 'Tipo' }, { llave: 'fechaCreacion', titulo: 'Fecha de Creación' }]
    },
    {
      id: 'archivos_mas_operaciones',
      titulo: 'Archivos con más Operaciones',
      columnas: [{ llave: 'nombreArchivo', titulo: 'Archivo' }, { llave: 'totalOperaciones', titulo: 'Total de Operaciones' }]
    },

    // Reportes de Usuarios
    {
      id: 'top_usuarios_archivos',
      titulo: 'Top 10 Usuarios con más Archivos',
      columnas: [{ llave: 'nombre', titulo: 'Usuario' }, { llave: 'email', titulo: 'Correo' }, { llave: 'totalArchivos', titulo: 'Total Archivos' }]
    },
    {
      id: 'usuarios_mas_comparten',
      titulo: 'Usuarios que más Comparten',
      columnas: [{ llave: 'nombre', titulo: 'Usuario' }, { llave: 'email', titulo: 'Correo' }, { llave: 'totalRecursosCompartidos', titulo: 'Recursos Compartidos' }]
    },

    // Reportes de Compartición
    {
      id: 'archivos_mas_usuarios',
      titulo: 'Archivos compartidos con más Usuarios',
      columnas: [{ llave: 'nombre', titulo: 'Archivo' }, { llave: 'tipo', titulo: 'Tipo' }, { llave: 'cantidadUsuarios', titulo: 'Total Invitados' }]
    },
    {
      id: 'recursos_compartidos_usuario',
      titulo: 'Recursos Enviados (Compartidos por Usuario)',
      requiereUsuarioId: true,
      columnas: [{ llave: 'nombre', titulo: 'Nombre del Recurso' }, { llave: 'tipoElemento', titulo: 'Tipo' }, { llave: 'path', titulo: 'Ubicación' }]
    },
    {
      id: 'recursos_recibidos_usuario',
      titulo: 'Recursos Recibidos por Usuario',
      requiereUsuarioId: true,
      columnas: [{ llave: 'nombre', titulo: 'Nombre del Recurso' }, { llave: 'tipoElemento', titulo: 'Tipo' }, { llave: 'path', titulo: 'Ubicación' }]
    },

    // Reportes de Actividad
    {
      id: 'historial_usuario_fechas',
      titulo: 'Historial de Usuario por Rango de Fechas',
      requiereUsuarioId: true,
      requiereFechas: true,
      columnas: [{ llave: 'accion', titulo: 'Acción' }, { llave: 'moduloAfectado', titulo: 'Módulo' }, { llave: 'nombreHistorico', titulo: 'Recurso' }, { llave: 'fecha', titulo: 'Fecha y Hora' }]
    },
    {
      id: 'actividad_operaciones',
      titulo: 'Operaciones Agrupadas por Tipo',
      columnas: [{ llave: '_id', titulo: 'Acción (Tipo)' }, { llave: 'total', titulo: 'Cantidad' }]
    },
    {
      id: 'operaciones_periodo',
      titulo: 'Operaciones Realizadas por Período',
      columnas: [{ llave: '_id', titulo: 'Período (Año-Mes)' }, { llave: 'total', titulo: 'Cantidad de Operaciones' }]
    },
    {
      id: 'principales_acciones',
      titulo: 'Principales Acciones del Sistema',
      columnas: [{ llave: '_id', titulo: 'Acción Principal' }, { llave: 'total', titulo: 'Total Histórico' }]
    }
  ];

  reporteActivo = signal<ConfiguracionReporte>(this.listaReportes[0]);

  constructor() {
    this.cargarUsuarios(); // Para poblar el select si algún reporte pide usuarioId
    this.generarReporte();
  }

  cargarUsuarios() {
    this.usuarioService.getUsuarios().subscribe(res => this.usuariosList.set(res));
  }

  seleccionarReporte(reporte: ConfiguracionReporte) {
    this.reporteActivo.set(reporte);
    this.datosReporte.set([]);
    this.error.set(null);
    if (!reporte.requiereFechas && !reporte.requiereUsuarioId) {
      this.generarReporte();
    }
  }

  generarReporte() {
    this.cargando.set(true);
    this.error.set(null);
    const repId = this.reporteActivo().id;

    let peticion$;

    switch (repId) {
      case 'archivos_tipo': peticion$ = this.reporteService.getCantidadArchivosPorTipo(); break;
      case 'archivos_rango': peticion$ = this.reporteService.getArchivosPorRangoFechas(this.fechaInicio(), this.fechaFin()); break;
      case 'archivos_mas_operaciones': peticion$ = this.reporteService.getArchivosConMasOperaciones(); break;
      case 'top_usuarios_archivos': peticion$ = this.reporteService.getTopUsuariosMasArchivos(); break;
      case 'usuarios_mas_comparten': peticion$ = this.reporteService.getUsuariosMasRecursosCompartidos(); break;
      case 'archivos_mas_usuarios': peticion$ = this.reporteService.getArchivosCompartidosConMasUsuarios(); break;
      case 'recursos_compartidos_usuario': peticion$ = this.reporteService.getRecursosCompartidosPorUsuario(this.usuarioSeleccionado()); break;
      case 'recursos_recibidos_usuario': peticion$ = this.reporteService.getRecursosRecibidosPorUsuario(this.usuarioSeleccionado()); break;
      case 'historial_usuario_fechas': peticion$ = this.reporteService.getHistorialUsuarioFechas(this.usuarioSeleccionado(), this.fechaInicio(), this.fechaFin()); break;
      case 'actividad_operaciones': peticion$ = this.reporteService.getOperacionesPorTipo(); break;
      case 'operaciones_periodo': peticion$ = this.reporteService.getOperacionesPorPeriodo(); break;
      case 'principales_acciones': peticion$ = this.reporteService.getPrincipalesAccionesSistema(); break;
      default:
        this.cargando.set(false);
        return;
    }

    peticion$.subscribe({
      next: (data: any) => {
        let datosAplanados = data;

        // --- MAPEO ESPECIAL ---
        // Si el backend devuelve un objeto complejo { carpetas: [], archivos: [] }, lo aplanamos para la tabla
        if (data && typeof data === 'object' && !Array.isArray(data) && data.carpetas && data.archivos) {
          const carpetasMap = data.carpetas.map((c: any) => ({ ...c, tipoElemento: 'Carpeta' }));
          const archivosMap = data.archivos.map((a: any) => ({ ...a, tipoElemento: `Archivo (${a.tipo})` }));
          datosAplanados = [...carpetasMap, ...archivosMap];
        }

        // Formateo rápido de fechas para que no se vean como ISO strings raros
        if (Array.isArray(datosAplanados)) {
          datosAplanados = datosAplanados.map(item => {
            if (item.fechaCreacion) item.fechaCreacion = new Date(item.fechaCreacion).toLocaleString();
            if (item.fecha) item.fecha = new Date(item.fecha).toLocaleString();
            return item;
          });
        }

        this.datosReporte.set(datosAplanados);
        this.cargando.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.error || err.error?.mensaje || 'Error al cargar el reporte desde el servidor.');
        this.cargando.set(false);
      }
    });
  }
}
