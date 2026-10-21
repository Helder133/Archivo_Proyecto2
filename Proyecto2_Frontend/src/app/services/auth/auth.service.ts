import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { LoginPayload, LoginResponse, Usuario } from '../../models/usuario.model';
import { Observable, tap } from 'rxjs';
import { RestConstants } from '../../shared/restapi/rest-constants';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private restConstants = new RestConstants();
  private apiUrl = `${this.restConstants.getApiUrl()}login`;

  currentUser = signal<Usuario | null>(null);

  constructor() {
    this.cargarUsuarioDesdeStorage();
  }

  login(credenciales: LoginPayload): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(this.apiUrl, { Login: credenciales }).pipe(
      tap(respuesta => {
        localStorage.setItem('token', respuesta.token);
        localStorage.setItem('usuario', JSON.stringify(respuesta.usuario));

        this.currentUser.set(respuesta.usuario);
      })
    );
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    this.currentUser.set(null);
    this.router.navigate(['/login']);
  }

  private cargarUsuarioDesdeStorage(): void {
    const usuarioGuardado = localStorage.getItem('usuario');
    if (usuarioGuardado) {
      this.currentUser.set(JSON.parse(usuarioGuardado));
    }
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }
}
