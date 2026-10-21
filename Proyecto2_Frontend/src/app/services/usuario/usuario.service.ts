import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { RestConstants } from '../../shared/restapi/rest-constants';
import { Observable } from 'rxjs';
import { Usuario } from '../../models/usuario.model';

@Injectable({
  providedIn: 'root',
})
export class UsuarioService {
  private http = inject(HttpClient);
  private restConstants = new RestConstants();
  private apiUrl = `${this.restConstants.getApiUrl()}usuario`;

  getUsuarios(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(this.apiUrl);
  }

  getUsuarioById(id: string): Observable<Usuario> {
    return this.http.get<Usuario>(`${this.apiUrl}/${id}`);
  }

  getUsuariosByCoincidencia(coincidence: string): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(`${this.apiUrl}/buscar/${coincidence}`);
  }

  createUsuario(usuario: Partial<Usuario>): Observable<any> {
    return this.http.post(this.apiUrl, { usuario });
  }

  updateUsuario(id: string, data: Partial<Usuario>): Observable<any> {
    console.log('Actualizando usuario con ID:', id, 'Datos:', data);
    return this.http.put(`${this.apiUrl}/${id}`, data);
  }

  updateEstadoUsuario(id: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}/estado`, {});
  }

}
