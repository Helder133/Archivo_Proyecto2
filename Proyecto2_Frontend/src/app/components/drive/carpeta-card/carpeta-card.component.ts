import { DatePipe } from '@angular/common';
import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { Carpeta } from '../../../models/carpeta.models';
import { AuthService } from '../../../services/auth/auth.service';

@Component({
  selector: 'app-carpeta-card',
  imports: [DatePipe],
  templateUrl: './carpeta-card.component.html'
})
export class CarpetaCardComponent {
  private authService = inject(AuthService);

  @Input({ required: true }) carpeta!: Carpeta;

  // Evento para cuando el usuario hace doble clic para entrar a la carpeta
  @Output() entrar = new EventEmitter<Carpeta>();
  // Evento para abrir el menú de opciones (Renombrar, Eliminar, etc)
  @Output() opciones = new EventEmitter<Carpeta>();

  get esCompartidoConmigo(): boolean {
    const miId = this.authService.currentUser()?._id;
    // Si el ID del creador de la carpeta es diferente a mi ID, es compartida
    return this.carpeta.usuarioId !== miId;
  }

  onDblClick() {
    this.entrar.emit(this.carpeta);
  }
}
