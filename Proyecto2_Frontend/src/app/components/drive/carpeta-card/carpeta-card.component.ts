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

  @Output() entrar = new EventEmitter<Carpeta>();
  @Output() editar = new EventEmitter<Carpeta>();
  @Output() eliminar = new EventEmitter<string>();
  @Output() compartir = new EventEmitter<Carpeta>();

  get esCompartidoConmigo(): boolean {
    const miId = this.authService.currentUser()?._id;
    // Si el ID del creador de la carpeta es diferente a mi ID, es compartida
    return this.carpeta.usuarioId !== miId;
  }

  get miPermiso(): string {
    if (!this.esCompartidoConmigo) return 'dueño';
    const miId = this.authService.currentUser()?._id;
    const colaborador = this.carpeta.compartidoCon.find((c: any) =>
      c.usuarioId === miId || c.usuarioId?._id === miId
    );
    return colaborador ? colaborador.permiso : 'lectura';
  }

  get puedeEditar(): boolean {
    return this.miPermiso === 'dueño' || this.miPermiso === 'editar';
  }

  onDblClick() {
    this.entrar.emit(this.carpeta);
  }
}
