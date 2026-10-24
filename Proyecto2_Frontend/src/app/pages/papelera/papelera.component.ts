import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ArchivoCardComponent } from '../../components/drive/archivo-card/archivo-card.component';
import { CarpetaCardComponent } from '../../components/drive/carpeta-card/carpeta-card.component';
import { PapeleraService } from '../../services/papelera/papelera.service';
import { CarpetaService } from '../../services/carpeta/carpeta.service';
import { ArchivoService } from '../../services/archive/archivo.service';
import { Carpeta } from '../../models/carpeta.models';
import { Archivo } from '../../models/archivo.models';
import { PapeleraResponse } from '../../models/papeleria.models';
import { AlmacenamientoService } from '../../services/almacenamiento/almacenamiento.service';

@Component({
  selector: 'app-papelera.component',
  imports: [CarpetaCardComponent, ArchivoCardComponent],
  templateUrl: './papelera.component.html'
})
export class PapeleraComponent implements OnInit {
  private papeleraService = inject(PapeleraService);
  private carpetaService = inject(CarpetaService);
  private archivoService = inject(ArchivoService);
  private almacenamientoService = inject(AlmacenamientoService);

  currentPath = signal<string>('/');
  carpetas = signal<Carpeta[]>([]);
  archivos = signal<Archivo[]>([]);
  cargando = signal<boolean>(false);
  errorMessage = signal<string | null>(null);

  breadcrumbs = computed(() => {
    const path = this.currentPath();
    if (path === '/') return [];
    return path.split('/').filter(p => p !== '');
  });

  // La regla de negocio: Solo hay acciones destructivas/restaurativas si estamos en la raíz
  esRaiz = computed(() => this.breadcrumbs().length === 0);

  ngOnInit() {
    this.cargarContenido();
  }

  cargarContenido() {
    this.cargando.set(true);
    this.errorMessage.set(null);
    const path = this.currentPath();

    if (path === '/') {
      this.papeleraService.getPapeleraRaiz().subscribe({
        next: (res: PapeleraResponse) => {
          this.carpetas.set(res.carpetas);
          this.archivos.set(res.archivos);
          this.cargando.set(false);
        },
        error: (err) => {
          this.errorMessage.set('Error al cargar la papelera.');
          this.cargando.set(false);
        }
      });
    } else {
      // Carga individual para subcarpetas de elementos eliminados
      this.papeleraService.getCarpetasPorPath(path).subscribe({
        next: (res) => this.carpetas.set(res)
      });
      this.papeleraService.getArchivosPorPath(path).subscribe({
        next: (res) => {
          this.archivos.set(res);
          this.cargando.set(false);
        }
      });
    }
  }

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

  // --- ACCIONES DE PAPELERA ---

  restaurarCarpeta(carpeta: Carpeta) {
    if (confirm(`¿Restaurar la carpeta "${carpeta.nombre}" y todo su contenido?`)) {
      this.carpetaService.cambiarEstadoCarpeta(carpeta._id).subscribe({
        next: () => {
          this.cargarContenido();
          this.almacenamientoService.notificarActualizacion();
        },
        error: (err) => this.errorMessage.set(err.error?.mensaje || 'Error al restaurar')
      });
    }
  }

  eliminarCarpetaFisica(id: string) {
    if (confirm('¿Eliminar DEFINITIVAMENTE esta carpeta? Esta acción no se puede deshacer.')) {
      this.carpetaService.eliminarCarpeta(id).subscribe({
        next: () => {
          this.cargarContenido();
          this.almacenamientoService.notificarActualizacion();
        },
        error: (err) => this.errorMessage.set(err.error?.mensaje || 'Error al eliminar')
      });
    }
  }

  restaurarArchivo(archivo: Archivo) {
    if (confirm(`¿Restaurar el archivo "${archivo.nombre}"?`)) {
      this.archivoService.cambiarEstadoArchivo(archivo._id).subscribe({
        next: () => {
          this.cargarContenido();
          this.almacenamientoService.notificarActualizacion();
        },
        error: (err) => this.errorMessage.set(err.error?.mensaje || 'Error al restaurar')
      });
    }
  }

  eliminarArchivoFisico(id: string) {
    if (confirm('¿Eliminar DEFINITIVAMENTE este archivo? Perderás su información para siempre.')) {
      this.archivoService.eliminarArchivo(id).subscribe({
        next: () => {
          this.cargarContenido();
          this.almacenamientoService.notificarActualizacion();
        },
        error: (err) => this.errorMessage.set(err.error?.mensaje || 'Error al eliminar')
      });
    }
  }
}