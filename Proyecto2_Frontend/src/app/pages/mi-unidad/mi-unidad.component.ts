import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CarpetaCardComponent } from '../../components/drive/carpeta-card/carpeta-card.component';
import { CarpetaService } from '../../services/carpeta/carpeta.service';
import { ArchivoService } from '../../services/archivo/archivo.service';
import { Carpeta } from '../../models/carpeta.models';
import { Archivo } from '../../models/archivo.models';
import { ArchivoCardComponent } from '../../components/drive/archivo-card/archivo-card.component';
import { CarpetaFormComponent } from '../../components/drive/carpeta-form/carpeta-form.component';
import { ArchivoFormComponent } from '../../components/drive/archivo-form/archivo-form.component';
import { UsuarioService } from '../../services/usuario/usuario.service';
import { Usuario } from '../../models/usuario.model';
import { CompartirFormComponent } from '../../components/drive/compartir-form/compartir-form.component';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs';

@Component({
  selector: 'app-mi-unidad.component',
  imports: [CarpetaCardComponent, ArchivoCardComponent, CarpetaFormComponent, ArchivoFormComponent, CompartirFormComponent, ReactiveFormsModule],
  templateUrl: './mi-unidad.component.html'
})
export class MiUnidadComponent implements OnInit {
  private carpetaService = inject(CarpetaService);
  private archivoService = inject(ArchivoService);
  private usuarioService = inject(UsuarioService);

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

  // Estado de compartir
  mostrarFormCompartir = signal<boolean>(false);
  usuariosDisponibles = signal<Usuario[]>([]);
  recursoACompartir = signal<{ id: string, nombre: string, tipo: 'archivo' | 'carpeta' } | null>(null);

  // Estado de colaboradores actuales (para mostrar en el formulario de compartir)
  colaboradoresActuales = signal<any[]>([]);

  // Estado del formulario de archivo (crear o actualizar contenido)
  modoFormArchivo = signal<'crear' | 'actualizar-contenido' | 'renombrar'>('crear');

  // Control Reactivo para el Buscador
  searchControl = new FormControl('');

  filtroActivo = signal<string>('todo');

  breadcrumbs = computed(() => {
    const path = this.currentPath();
    if (path === '/') return [];
    return path.split('/').filter(p => p !== '');
  });

  ngOnInit() {
    this.cargarContenido();
    this.escucharBuscador();
  }

  escucharBuscador(): void {
    this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe((termino) => {
      this.filtroActivo.set('todo');
      if (termino && termino.trim() !== '') {
        this.buscarPorCoincidencia(termino.trim());
      } else {
        this.cargarContenido(); // Si borra el texto, vuelve a la ruta actual
      }
    });
  }

  filtrarPorExtension(extension: string) {
    if (this.filtroActivo() === extension || extension === 'todo') {
      this.filtroActivo.set('todo');
      this.searchControl.setValue('', { emitEvent: false });
      this.cargarContenido();
      return;
    }

    this.filtroActivo.set(extension);
    this.searchControl.setValue('', { emitEvent: false });
    this.cargando.set(true);

    this.carpetas.set([]);

    this.archivoService.getArchivosByExtension(extension).subscribe({
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

  buscarPorCoincidencia(termino: string) {
    this.cargando.set(true);

    this.carpetaService.getCarpetasByNombre(termino).subscribe({
      next: (res) => this.carpetas.set(res),
      error: (err) => console.error(err)
    });

    this.archivoService.getArchivosByNombre(termino).subscribe({
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
    this.filtroActivo.set('todo');
    this.searchControl.setValue('', { emitEvent: false });
    this.currentPath.set(`${carpeta.path}${carpeta.nombre}/`);
    this.cargarContenido();
  }

  navegarAMiga(index: number) {
    this.filtroActivo.set('todo');
    this.searchControl.setValue('', { emitEvent: false });
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
    this.searchControl.disable();
  }

  guardarCarpeta(datos: { nombre: string }) {
    const carpetaActual = this.carpetaSeleccionada();

    if (carpetaActual && carpetaActual._id) {
      // MODO EDICIÓN (RENOMBRAR)
      this.carpetaService.updateCarpeta(carpetaActual._id, { nombre: datos.nombre }).subscribe({
        next: () => {
          this.cerrarFormularios();
          this.cargarContenido();
        },
        error: (err) => this.errorMessage.set(err.error?.mensaje || 'Error al renombrar carpeta')
      });
    } else {
      // MODO CREACIÓN
      const dataConPath = { ...datos, path: this.currentPath() };
      this.carpetaService.createCarpeta(dataConPath).subscribe({
        next: () => {
          this.cerrarFormularios();
          this.cargarContenido();
        },
        error: (err) => this.errorMessage.set(err.error?.error || err.error?.mensaje || 'Error al crear carpeta')
      });
    }
  }

  // --- CONTROL DE FORMULARIOS ARCHIVO ---
  abrirSubirArchivo() {
    this.archivoSeleccionado.set(null);
    this.errorMessage.set(null);
    this.modoFormArchivo.set('crear');
    this.mostrarFormArchivo.set(true);
    this.searchControl.disable();
  }

  abrirActualizarContenido(archivo: Archivo) {
    this.cerrarFormularios();
    this.archivoSeleccionado.set(archivo);
    this.modoFormArchivo.set('actualizar-contenido');
    this.mostrarFormArchivo.set(true);
    this.searchControl.disable();
  }

  guardarArchivo(datos: { nombre: string, archivoFisico?: File }) {
    if (this.modoFormArchivo() === 'crear') {
      if (!datos.archivoFisico) return;
      const metaData = { nombre: datos.nombre, path: this.currentPath() };

      this.archivoService.createArchivo(metaData, datos.archivoFisico).subscribe({
        next: () => {
          this.cerrarFormularios();
          this.cargarContenido();
        },
        error: (err) => this.errorMessage.set(err.error?.error || err.error?.mensaje || 'Error al subir archivo')
      });
    } else if (this.modoFormArchivo() === 'actualizar-contenido') {
      const id = this.archivoSeleccionado()?._id;
      if (id && datos.archivoFisico) {
        this.archivoService.actualizarContenido(id, datos.archivoFisico).subscribe({
          next: () => {
            this.cerrarFormularios();
            this.cargarContenido();
          },
          error: (err) => this.errorMessage.set(err.error?.mensaje || 'Error al actualizar contenido')
        });
      }
    } else if (this.modoFormArchivo() === 'renombrar') {
      const id = this.archivoSeleccionado()?._id;
      if (id) {
        this.archivoService.renombrarArchivo(id, datos.nombre).subscribe({
          next: () => {
            this.cerrarFormularios();
            this.cargarContenido();
          },
          error: (err) => this.errorMessage.set(err.error?.mensaje || 'Error al renombrar archivo')
        });
      }
    }
  }

  // Método para abrir el formulario (Llamado desde el card del archivo)
  abrirCompartirArchivo(archivo: Archivo) {
    this.cerrarFormularios();
    this.recursoACompartir.set({ id: archivo._id, nombre: archivo.nombre, tipo: 'archivo' });
    this.searchControl.disable();

    // 1. Mapeamos a los colaboradores actuales usando los datos que YA Vienen poblados desde el backend
    const colabs = archivo.compartidoCon.map((c: any) => {
      // Como usamos .populate() en Mongoose, c.usuarioId ahora es un objeto { _id, nombre, email }
      return {
        // Extraemos el ID dependiendo de si Mongoose lo mandó como string o como objeto poblado
        usuarioId: c.usuarioId._id ? c.usuarioId._id : c.usuarioId,
        nombre: c.usuarioId.nombre || 'Usuario',
        email: c.usuarioId.email || 'Desconocido',
        permiso: c.permiso
      };
    });

    this.colaboradoresActuales.set(colabs);

    // 2. Solo hacemos la petición para buscar a los "Disponibles"
    this.usuarioService.getUsuariosDisponibles('archivo', archivo._id).subscribe({
      next: (usuarios) => {
        this.usuariosDisponibles.set(usuarios);
        this.mostrarFormCompartir.set(true);
      },
      error: (err) => this.errorMessage.set('Error al cargar usuarios disponibles.')
    });
  }

  // Método que recibe el evento del formulario y guarda
  guardarCompartir(datosCompartir: any[]) {
    const recurso = this.recursoACompartir();
    if (!recurso) return;

    if (recurso.tipo === 'archivo') {
      this.archivoService.compartirArchivo(recurso.id, datosCompartir).subscribe({
        next: () => {
          this.cerrarFormularios();
          const termino = this.searchControl.value;
          if (termino && termino.trim() !== '') {
            this.buscarPorCoincidencia(termino.trim());
          } else {
            this.cargarContenido();
          }
        },
        error: (err) => this.errorMessage.set(err.error?.mensaje || 'Error al compartir archivo')
      });
    }
    // Si luego habilitas carpetas, pones el else if (recurso.tipo === 'carpeta') {...}
  }

  // --- ACCIONES GENERALES ---
  cerrarFormularios() {
    this.mostrarFormCarpeta.set(false);
    this.mostrarFormArchivo.set(false);
    this.mostrarFormCompartir.set(false);
    this.errorMessage.set(null);
    this.searchControl.enable();
  }

  actualizarPermisoColaborador(datos: { usuarioId: string, permiso: string }) {
    const recurso = this.recursoACompartir();
    if (!recurso) return;

    if (recurso.tipo === 'archivo') {
      this.archivoService.cambiarPermisoDeCompartido(recurso.id, datos).subscribe({
        next: () => {
          this.cerrarFormularios();
          this.cargarContenido(); // Refrescamos la vista principal
        },
        error: (err) => this.errorMessage.set(err.error?.mensaje || 'Error al actualizar permiso')
      });
    }
  }

  revocarAccesoColaborador(usuarioId: string) {
    const recurso = this.recursoACompartir();
    if (!recurso) return;

    if (recurso.tipo === 'archivo') {
      this.archivoService.eliminarCompartido(recurso.id, usuarioId).subscribe({
        next: () => {
          this.cerrarFormularios();
          this.cargarContenido();
        },
        error: (err) => this.errorMessage.set(err.error?.mensaje || 'Error al revocar acceso')
      });
    }
  }

  descargarArchivo(id: string) {
    const file = this.archivos().find(a => a._id === id);
    if (!file) return;

    this.archivoService.descargarArchivo(id).subscribe({
      next: (blob) => {
        // Creamos una URL temporal para el binario
        const url = window.URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = `${file.nombre}${file.tipo}`; // Ej: documento.txt

        // Simulamos un clic para forzar la descarga y luego limpiamos la memoria
        document.body.appendChild(anchor);
        anchor.click();
        document.body.removeChild(anchor);
        window.URL.revokeObjectURL(url);
      },
      error: (err) => this.errorMessage.set('Error al descargar el archivo físico.')
    });
  }

  // --- ELIMINACIÓN LÓGICA (PAPELERA) ---
  moverCarpetaAPapelera(id: string) {
    if (confirm('¿Estás seguro de mover esta carpeta y todo su contenido a la papelera?')) {
      this.carpetaService.cambiarEstadoCarpeta(id).subscribe({
        next: () => this.cargarContenido(),
        error: (err) => this.errorMessage.set(err.error?.mensaje || 'Error al mover a papelera')
      });
    }
  }

  moverArchivoAPapelera(id: string) {
    if (confirm('¿Estás seguro de mover este archivo a la papelera?')) {
      this.archivoService.cambiarEstadoArchivo(id).subscribe({
        next: () => this.cargarContenido(),
        error: (err) => this.errorMessage.set(err.error?.mensaje || 'Error al mover a papelera')
      });
    }
  }

  // --- EDICIÓN DE METADATA (RENOMBRAR) ---
  abrirRenombrarCarpeta(carpeta: Carpeta) {
    this.cerrarFormularios();
    this.carpetaSeleccionada.set(carpeta);
    this.mostrarFormCarpeta.set(true);
    this.searchControl.disable();
  }

  abrirRenombrarArchivo(archivo: Archivo) {
    this.cerrarFormularios();
    this.archivoSeleccionado.set(archivo);
    this.modoFormArchivo.set('renombrar');
    this.mostrarFormArchivo.set(true);
    this.searchControl.disable();
  }

}