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
  @Output() opciones = new EventEmitter<Archivo>(); // Para eliminar/compartir/etc
  @Output() compartir = new EventEmitter<Archivo>();
  
  get esCompartidoConmigo(): boolean {
    const miId = this.authService.currentUser()?._id;
    return this.archivo.usuarioId !== miId;
  }

  onDescargar() {
    this.descargar.emit(this.archivo._id);
  }
}
