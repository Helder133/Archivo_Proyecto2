import { Component, inject, OnInit, signal } from '@angular/core';
import { VisorArchivoComponent } from '../../components/drive/visor-archivo/visor-archivo.component';
import { ArchivoCardComponent } from '../../components/drive/archivo-card/archivo-card.component';
import { CarpetaCardComponent } from '../../components/drive/carpeta-card/carpeta-card.component';
import { CompartidoService } from '../../services/compartido/compartido.service';
import { ArchivoService } from '../../services/archivo/archivo.service';
import { Router } from '@angular/router';
import { Carpeta } from '../../models/carpeta.models';
import { Archivo } from '../../models/archivo.models';
import { CompartidoResponse } from '../../models/compartido.models';
import { UsuarioService } from '../../services/usuario/usuario.service';
import { Usuario } from '../../models/usuario.model';
import { ArchivoFormComponent } from '../../components/drive/archivo-form/archivo-form.component';
import { CompartirFormComponent } from '../../components/drive/compartir-form/compartir-form.component';
import { CarpetaService } from '../../services/carpeta/carpeta.service';
import { CarpetaFormComponent } from '../../components/drive/carpeta-form/carpeta-form.component';

@Component({
  selector: 'app-compartido.component',
  imports: [CarpetaCardComponent, ArchivoCardComponent, VisorArchivoComponent, ArchivoFormComponent, CompartirFormComponent, CarpetaFormComponent],
  templateUrl: './compartido.component.html'
})
export class CompartidoComponent implements OnInit {
  private compartidoService = inject(CompartidoService);
  private archivoService = inject(ArchivoService);
  private carpetaService = inject(CarpetaService);
  private usuarioService = inject(UsuarioService);
  private router = inject(Router);

  carpetas = signal<Carpeta[]>([]);
  archivos = signal<Archivo[]>([]);
  cargando = signal<boolean>(false);
  errorMessage = signal<string | null>(null);

  // Estados de formularios y visor
  mostrarVisor = signal<boolean>(false);
  blobVisualizacion = signal<Blob | null>(null);
  archivoSeleccionado = signal<Archivo | null>(null);

  mostrarFormArchivo = signal<boolean>(false);
  modoFormArchivo = signal<'actualizar-contenido' | 'renombrar'>('actualizar-contenido');

  mostrarFormCompartir = signal<boolean>(false);
  usuariosDisponibles = signal<Usuario[]>([]);
  recursoACompartir = signal<{ id: string, nombre: string, tipo: 'archivo' | 'carpeta' } | null>(null);
  colaboradoresActuales = signal<any[]>([]);

  mostrarFormCarpeta = signal<boolean>(false);
  carpetaSeleccionada = signal<Carpeta | null>(null);

  ngOnInit() {
    this.cargarCompartidos();
  }

  cargarCompartidos() {
    this.cargando.set(true);
    this.compartidoService.getCompartidosConmigo().subscribe({
      next: (res: CompartidoResponse) => {
        this.carpetas.set(res.carpetas);
        this.archivos.set(res.archivos);
        this.cargando.set(false);
      },
      error: (err) => {
        this.errorMessage.set('Error al cargar los documentos compartidos.');
        this.cargando.set(false);
      }
    });
  }

  entrarACarpeta(carpeta: Carpeta) {
    const rutaDestino = `${carpeta.path}${carpeta.nombre}/`;
    this.router.navigate(['/usuario/mi-unidad'], { queryParams: { path: rutaDestino } });
  }

  // --- LÓGICA DE EDICIÓN ---
  cerrarFormularios() {
    this.mostrarFormArchivo.set(false);
    this.mostrarFormCarpeta.set(false);
    this.mostrarFormCompartir.set(false);
    this.mostrarVisor.set(false);
    this.blobVisualizacion.set(null);
    this.archivoSeleccionado.set(null);
    this.carpetaSeleccionada.set(null);
    this.errorMessage.set(null);
  }

  abrirActualizarContenido(archivo: Archivo) {
    this.cerrarFormularios();
    this.archivoSeleccionado.set(archivo);
    this.modoFormArchivo.set('actualizar-contenido');
    this.mostrarFormArchivo.set(true);
  }

  abrirRenombrarArchivo(archivo: Archivo) {
    this.cerrarFormularios();
    this.archivoSeleccionado.set(archivo);
    this.modoFormArchivo.set('renombrar');
    this.mostrarFormArchivo.set(true);
  }

  guardarArchivo(datos: { nombre: string, archivoFisico?: File }) {
    const id = this.archivoSeleccionado()?._id;
    if (!id) return;

    if (this.modoFormArchivo() === 'actualizar-contenido' && datos.archivoFisico) {
      this.archivoService.actualizarContenido(id, datos.archivoFisico).subscribe({
        next: () => { this.cerrarFormularios(); this.cargarCompartidos(); },
        error: (err) => this.errorMessage.set(err.error?.mensaje || 'Error al actualizar')
      });
    } else if (this.modoFormArchivo() === 'renombrar') {
      this.archivoService.renombrarArchivo(id, datos.nombre).subscribe({
        next: () => { this.cerrarFormularios(); this.cargarCompartidos(); },
        error: (err) => this.errorMessage.set(err.error?.mensaje || 'Error al renombrar')
      });
    }
  }

  // --- LÓGICA DE COMPARTIR ---
  abrirCompartirArchivo(archivo: Archivo) {
    this.cerrarFormularios();
    this.recursoACompartir.set({ id: archivo._id, nombre: archivo.nombre, tipo: 'archivo' });

    const colabs = archivo.compartidoCon.map((c: any) => ({
      usuarioId: c.usuarioId._id ? c.usuarioId._id : c.usuarioId,
      nombre: c.usuarioId.nombre || 'Usuario',
      email: c.usuarioId.email || 'Desconocido',
      permiso: c.permiso
    }));
    this.colaboradoresActuales.set(colabs);

    this.usuarioService.getUsuariosDisponibles('archivo', archivo._id).subscribe({
      next: (usuarios) => {
        this.usuariosDisponibles.set(usuarios);
        this.mostrarFormCompartir.set(true);
      },
      error: () => this.errorMessage.set('Error al cargar usuarios disponibles.')
    });
  }

  guardarCompartir(datosCompartir: any[]) {
    const recurso = this.recursoACompartir();
    if (!recurso) return;

    if (recurso.tipo === 'archivo') {
      this.archivoService.compartirArchivo(recurso.id, datosCompartir).subscribe({
        next: () => { this.cerrarFormularios(); this.cargarCompartidos(); }, // Usa cargarCompartidos() en compartidos.component
        error: (err) => this.errorMessage.set(err.error?.mensaje || 'Error al compartir archivo')
      });
    } else if (recurso.tipo === 'carpeta') {
      this.carpetaService.compartirCarpeta(recurso.id, datosCompartir).subscribe({
        next: () => { this.cerrarFormularios(); this.cargarCompartidos(); },
        error: (err) => this.errorMessage.set(err.error?.mensaje || 'Error al compartir carpeta')
      });
    }
  }

  actualizarPermisoColaborador(datos: { usuarioId: string, permiso: string }) {
    const recurso = this.recursoACompartir();
    if (!recurso) return;

    if (recurso.tipo === 'archivo') {
      this.archivoService.cambiarPermisoDeCompartido(recurso.id, datos).subscribe({
        next: () => { this.cerrarFormularios(); this.cargarCompartidos(); },
        error: (err) => this.errorMessage.set(err.error?.mensaje || 'Error al actualizar permiso')
      });
    } else if (recurso.tipo === 'carpeta') {
      this.carpetaService.cambiarPermisoDeCompartido(recurso.id, datos).subscribe({
        next: () => { this.cerrarFormularios(); this.cargarCompartidos(); },
        error: (err) => this.errorMessage.set(err.error?.mensaje || 'Error al actualizar permiso')
      });
    }
  }

  revocarAccesoColaborador(usuarioId: string) {
    const recurso = this.recursoACompartir();
    if (!recurso) return;

    if (recurso.tipo === 'archivo') {
      this.archivoService.eliminarCompartido(recurso.id, usuarioId).subscribe({
        next: () => { this.cerrarFormularios(); this.cargarCompartidos(); },
        error: (err) => this.errorMessage.set(err.error?.mensaje || 'Error al revocar acceso')
      });
    } else if (recurso.tipo === 'carpeta') {
      this.carpetaService.eliminarCompartido(recurso.id, usuarioId).subscribe({
        next: () => { this.cerrarFormularios(); this.cargarCompartidos(); },
        error: (err) => this.errorMessage.set(err.error?.mensaje || 'Error al revocar acceso')
      });
    }
  }

  abrirCompartirCarpeta(carpeta: Carpeta) {
    this.cerrarFormularios();
    this.recursoACompartir.set({ id: carpeta._id, nombre: carpeta.nombre, tipo: 'carpeta' });

    const colabs = carpeta.compartidoCon.map((c: any) => ({
      usuarioId: c.usuarioId._id ? c.usuarioId._id : c.usuarioId,
      nombre: c.usuarioId.nombre || 'Usuario',
      email: c.usuarioId.email || 'Desconocido',
      permiso: c.permiso
    }));

    this.colaboradoresActuales.set(colabs);

    this.usuarioService.getUsuariosDisponibles('carpeta', carpeta._id).subscribe({
      next: (usuarios) => {
        this.usuariosDisponibles.set(usuarios);
        this.mostrarFormCompartir.set(true);
      },
      error: () => this.errorMessage.set('Error al cargar usuarios disponibles.')
    });
  }

  abrirRenombrarCarpeta(carpeta: Carpeta) {
    this.cerrarFormularios();
    this.carpetaSeleccionada.set(carpeta);
    this.mostrarFormCarpeta.set(true);
  }

  guardarCarpeta(datos: { nombre: string }) {
    const carpetaActual = this.carpetaSeleccionada();

    if (carpetaActual && carpetaActual._id) {
      this.carpetaService.updateCarpeta(carpetaActual._id, { nombre: datos.nombre }).subscribe({
        next: () => {
          this.cerrarFormularios();
          this.cargarCompartidos();
        },
        error: (err) => this.errorMessage.set(err.error?.mensaje || 'Error al renombrar carpeta')
      });
    }
  }

  // --- VISOR Y DESCARGA ---
  descargarArchivo(id: string) {
    const file = this.archivos().find(a => a._id === id);
    if (!file) return;

    this.archivoService.descargarArchivo(id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = `${file.nombre}${file.tipo}`;
        document.body.appendChild(anchor);
        anchor.click();
        document.body.removeChild(anchor);
        window.URL.revokeObjectURL(url);
      },
      error: () => this.errorMessage.set('Error al descargar el archivo.')
    });
  }

  abrirVisorArchivo(archivo: Archivo) {
    this.archivoSeleccionado.set(archivo);
    this.cargando.set(true);

    this.archivoService.descargarArchivo(archivo._id).subscribe({
      next: (blob) => {
        this.blobVisualizacion.set(blob);
        this.mostrarVisor.set(true);
        this.cargando.set(false);
      },
      error: () => {
        this.errorMessage.set('Error al previsualizar.');
        this.cargando.set(false);
      }
    });
  }
}