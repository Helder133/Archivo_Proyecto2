import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Archivo } from '../../../models/archivo.models';

@Component({
  selector: 'app-archivo-card',
  imports: [CommonModule],
  templateUrl: './archivo-card.component.html'
})
export class ArchivoCardComponent {
  @Input({ required: true }) archivo!: Archivo;

  // Eventos hacia el padre
  @Output() descargar = new EventEmitter<string>();
  @Output() editarMetadata = new EventEmitter<Archivo>();
  @Output() editarContenido = new EventEmitter<Archivo>(); // Para cuando implementes el PUT de contenido
  @Output() opciones = new EventEmitter<Archivo>(); // Para eliminar/compartir/etc

  onDescargar() {
    this.descargar.emit(this.archivo._id);
  }
}
