import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../services/auth/auth.service';
import { AlmacenamientoService } from '../../../services/almacenamiento/almacenamiento.service';
import { AlmacenamientoResponse } from '../../../models/almacenamiento.models';

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html'
})
export class SidebarComponent implements OnInit {
  private authService = inject(AuthService);
  private almacenamientoService = inject(AlmacenamientoService);

  almacenamiento = signal<AlmacenamientoResponse | null>(null);

  usuarioActual = this.authService.currentUser;

  ngOnInit() {
    this.cargarAlmacenamiento();

    this.almacenamientoService.actualizacion$.subscribe(() => {
      this.cargarAlmacenamiento();
    });
  }

  cargarAlmacenamiento() {
    this.almacenamientoService.getEstadoAlmacenamiento().subscribe({
      next: (res) => this.almacenamiento.set(res),
      error: (err) => console.error('Error al cargar almacenamiento', err)
    });
  }

  cerrarSesion(): void {
    this.authService.logout();
  }

  formatBytes(bytes: number, decimals = 2) {
    if (!+bytes) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
  }
}
