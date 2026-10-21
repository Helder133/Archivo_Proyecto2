import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CarpetaCardComponent } from '../../components/drive/carpeta-card/carpeta-card.component';
import { CarpetaService } from '../../services/carpeta/carpeta.service';
import { ArchivoService } from '../../services/archivo/archivo.service';
import { Carpeta } from '../../models/carpeta.models';
import { Archivo } from '../../models/archivo.models';
import { ArchivoCardComponent } from '../../components/drive/archivo-card/archivo-card.component';
import { CarpetaFormComponent } from '../../components/drive/carpeta-form/carpeta-form.component';
import { ArchivoFormComponent } from '../../components/drive/archivo-form/archivo-form.component';

@Component({
  selector: 'app-mi-unidad.component',
  imports: [CarpetaCardComponent, ArchivoCardComponent, CarpetaFormComponent, ArchivoFormComponent],
  templateUrl: './mi-unidad.component.html'
})
export class MiUnidadComponent implements OnInit {
  private carpetaService = inject(CarpetaService);
  private archivoService = inject(ArchivoService);

  // Estados de navegación
  currentPath = signal<string>('/');
  carpetas = signal<Carpeta[]>([]);
  archivos = signal<Archivo[]>([]);
  cargando = signal<boolean>(false);

  // Estados de la interfaz (Formularios)
  mostrarFormCarpeta = signal<boolean>(false);
  mostrarFormArchivo = signal<boolean>(false);
  carpetaSeleccionada = signal<Carpeta | null>(null);
  archivoSeleccionado = signal<Archivo | null>(null);
  errorMessage = signal<string | null>(null);

  breadcrumbs = computed(() => {
    const path = this.currentPath();
    if (path === '/') return [];
    return path.split('/').filter(p => p !== '');
  });

  ngOnInit() {
    this.cargarContenido();
  }

  cargarContenido() {
    this.cargando.set(true);
    const path = this.currentPath();

    this.carpetaService.getCarpetasByPath(path).subscribe({
      next: (res) => this.carpetas.set(res),
      error: (err) => console.error(err)
    });

    this.archivoService.getArchivosByPath(path).subscribe({
      next: (res) => {
        this.archivos.set(res);
        this.cargando.set(false);
      },
      error: (err) => {
        console.error(err);
        this.cargando.set(false);
      }
    });
  }

  // --- NAVEGACIÓN ---
  entrarACarpeta(carpeta: Carpeta) {
    this.currentPath.set(`${carpeta.path}${carpeta.nombre}/`);
    this.cargarContenido();
  }

  navegarAMiga(index: number) {
    if (index === -1) {
      this.currentPath.set('/');
    } else {
      const parts = this.breadcrumbs().slice(0, index + 1);
      this.currentPath.set(`/${parts.join('/')}/`);
    }
    this.cargarContenido();
  }

  // --- CONTROL DE FORMULARIOS CARPETA ---
  abrirNuevaCarpeta() {
    this.carpetaSeleccionada.set(null);
    this.errorMessage.set(null);
    this.mostrarFormCarpeta.set(true);
  }

  guardarCarpeta(datos: { nombre: string }) {
    const dataConPath = { ...datos, path: this.currentPath() };

    this.carpetaService.createCarpeta(dataConPath).subscribe({
      next: () => {
        this.mostrarFormCarpeta.set(false);
        this.cargarContenido();
      },
      error: (err) => this.errorMessage.set(err.error?.error || err.error?.mensaje || 'Error al crear carpeta')
    });
  }

  // --- CONTROL DE FORMULARIOS ARCHIVO ---
  abrirSubirArchivo() {
    this.archivoSeleccionado.set(null);
    this.errorMessage.set(null);
    this.mostrarFormArchivo.set(true);
  }

  guardarArchivo(datos: { nombre: string, archivoFisico?: File }) {
    if (!datos.archivoFisico) return; // Validación extra

    const metaData = { nombre: datos.nombre, path: this.currentPath() };

    this.archivoService.createArchivo(metaData, datos.archivoFisico).subscribe({
      next: () => {
        this.mostrarFormArchivo.set(false);
        this.cargarContenido();
      },
      error: (err) => this.errorMessage.set(err.error?.error || err.error?.mensaje || 'Error al subir archivo')
    });
  }

  // --- ACCIONES GENERALES ---
  cerrarFormularios() {
    this.mostrarFormCarpeta.set(false);
    this.mostrarFormArchivo.set(false);
    this.errorMessage.set(null);
  }

  descargarArchivo(id: string) {
    // Aquí llamarás a tu archivoService.descargarArchivo(id)
    console.log('Descargando archivo:', id);
  }
}