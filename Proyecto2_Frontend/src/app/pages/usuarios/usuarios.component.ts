import { Component, inject, OnInit, signal } from '@angular/core';
import { UsuarioCardComponent } from '../../components/usuario/usuario-card/usuario-card.component';
import { UsuarioFormComponent } from '../../components/usuario/usuario-form/usuario-form.component';
import { UsuarioService } from '../../services/usuario/usuario.service';
import { Usuario } from '../../models/usuario.model';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs';

@Component({
  selector: 'app-usuarios',
  imports: [UsuarioFormComponent, UsuarioCardComponent, ReactiveFormsModule],
  templateUrl: './usuarios.component.html'
})
export class UsuariosComponent implements OnInit {
  private usuarioService = inject(UsuarioService);

  // Señales para manejar el estado reactivo
  usuarios = signal<Usuario[]>([]);
  mostrarFormulario = signal<boolean>(false);
  usuarioSeleccionado = signal<Usuario | null>(null);
  errorMessage = signal<string | null>(null);

  searchControl = new FormControl('');

  ngOnInit(): void {
    this.cargarUsuarios();
    this.escucharBuscador();
  }

  escucharBuscador(): void {
    this.searchControl.valueChanges.pipe(
      debounceTime(300), // Espera 300ms después de la última tecla
      distinctUntilChanged() // Solo dispara si el texto realmente cambió
    ).subscribe((termino) => {
      if (termino && termino.trim() !== '') {
        this.usuarioService.getUsuariosByCoincidencia(termino).subscribe({
          next: (data) => this.usuarios.set(data),
          error: (err) => console.error('Error en búsqueda', err)
        });
      } else {
        this.cargarUsuarios();
      }
    });
  }

  cargarUsuarios(): void {
    this.usuarioService.getUsuarios().subscribe({
      next: (data) => this.usuarios.set(data),
      error: (err) => console.error('Error cargando usuarios', err)
    });
  }

  abrirFormularioCrear(): void {
    this.usuarioSeleccionado.set(null);
    this.errorMessage.set(null);
    this.mostrarFormulario.set(true);
    this.searchControl.disable();
  }

  abrirFormularioEditar(usuario: Usuario): void {
    this.usuarioSeleccionado.set(usuario);
    this.errorMessage.set(null);
    this.mostrarFormulario.set(true);
    this.searchControl.disable();
  }

  cerrarFormulario(): void {
    this.mostrarFormulario.set(false);
    this.usuarioSeleccionado.set(null);
    this.searchControl.enable();

    const termino = this.searchControl.value;
    if (termino && termino.trim() !== '') {
      this.searchControl.setValue(termino);
    } else {
      this.cargarUsuarios();
    }
  }

  // Recibe el evento del componente hijo
  guardarUsuario(datosFormulario: Partial<Usuario>): void {
    const usuarioActual = this.usuarioSeleccionado();

    if (usuarioActual && usuarioActual._id) {
      // Modo Edición
      this.usuarioService.updateUsuario(usuarioActual._id, datosFormulario).subscribe({
        next: () => {
          this.cargarUsuarios();
          this.cerrarFormulario();
        },
        error: (err) => {
          this.errorMessage.set(err.error?.mensaje || err.error?.error || 'Error al actualizar el usuario.');
        }
      });
    } else {
      // Modo Creación
      this.usuarioService.createUsuario(datosFormulario).subscribe({
        next: () => {
          this.cargarUsuarios();
          this.cerrarFormulario();
        },
        error: (err) => {
          this.errorMessage.set(err.error?.mensaje || err.error?.error || 'Error al crear el usuario.');
        }
      });
    }
  }

  cambiarEstado(id: string): void {
    this.usuarioService.updateEstadoUsuario(id).subscribe({
      next: () => this.cargarUsuarios(),
      error: (err) => console.error('Error al cambiar estado', err)
    });
  }
}
