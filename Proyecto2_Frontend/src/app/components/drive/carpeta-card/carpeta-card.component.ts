import { DatePipe } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Carpeta } from '../../../models/carpeta.models';

@Component({
  selector: 'app-carpeta-card',
  imports: [DatePipe],
  templateUrl: './carpeta-card.component.html'
})
export class CarpetaCardComponent {
  @Input({ required: true }) carpeta!: Carpeta;

  // Evento para cuando el usuario hace doble clic para entrar a la carpeta
  @Output() entrar = new EventEmitter<Carpeta>();
  // Evento para abrir el menú de opciones (Renombrar, Eliminar, etc)
  @Output() opciones = new EventEmitter<Carpeta>();

  onDblClick() {
    this.entrar.emit(this.carpeta);
  }
}
