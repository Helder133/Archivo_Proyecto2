import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { Archivo } from '../../../models/archivo.models';
import { AuthService } from '../../../services/auth/auth.service';

@Component({
  selector: 'app-archivo-card',
  imports: [CommonModule],
  templateUrl: './archivo-card.component.html'
})
export class ArchivoCardComponent {
  private authService = inject(AuthService);

  @Input({ required: true }) archivo!: Archivo;

  // Eventos hacia el padre
  @Output() descargar = new EventEmitter<string>();
  @Output() editarMetadata = new EventEmitter<Archivo>();
  @Output() editarContenido = new EventEmitter<Archivo>(); // Para cuando implementes el PUT de contenido
  @Output() compartir = new EventEmitter<Archivo>();
  @Output() eliminar = new EventEmitter<string>();
  @Output() visualizar = new EventEmitter<Archivo>();

  onVisualizar() {
    this.visualizar.emit(this.archivo);
  }

  get esCompartidoConmigo(): boolean {
    const miId = this.authService.currentUser()?._id;
    return this.archivo.usuarioId !== miId;
  }

  get miPermiso(): string {
    if (!this.esCompartidoConmigo) return 'dueño';

    const miId = this.authService.currentUser()?._id;
    const colaborador = this.archivo.compartidoCon.find((c: any) =>
      c.usuarioId === miId || c.usuarioId?._id === miId // Soporta si viene poblado o crudo
    );

    return colaborador ? colaborador.permiso : 'lectura';
  }

  get puedeEditar(): boolean {
    // Solo los dueños y los editores pueden ver los botones de modificación y eliminación
    return this.miPermiso === 'dueño' || this.miPermiso === 'editar';
  }

  onDescargar() {
    this.descargar.emit(this.archivo._id);
  }
}
