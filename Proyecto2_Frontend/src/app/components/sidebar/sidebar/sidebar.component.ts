import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../services/auth/auth.service';

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html'
})
export class SidebarComponent {
  private authService = inject(AuthService);

  usuarioActual = this.authService.currentUser;

  cerrarSesion(): void {
    this.authService.logout();
  }
}
