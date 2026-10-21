import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Usuario } from '../../../models/usuario.model';

@Component({
  selector: 'app-usuario-card',
  imports: [CommonModule],
  templateUrl: './usuario-card.component.html'
})
export class UsuarioCardComponent {
  @Input({ required: true }) usuario!: Usuario;

  @Output() editar = new EventEmitter<Usuario>();
  @Output() cambiarEstado = new EventEmitter<string>();

  onEditar(): void {
    this.editar.emit(this.usuario);
  }

  onCambiarEstado(): void {
    this.cambiarEstado.emit(this.usuario._id);
  }
}
