import { inject, Injectable } from '@angular/core';
import { RestConstants } from '../../shared/restapi/rest-constants';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Carpeta } from '../../models/carpeta.models';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CarpetaService {
  private http = inject(HttpClient);
  private restConstants = new RestConstants();
  private apiUrl = `${this.restConstants.getApiUrl()}carpeta`;

  // --- MÉTODOS DE LECTURA ---
  getCarpetasByPath(path: string): Observable<Carpeta[]> {
    const params = new HttpParams().set('path', path);
    return this.http.get<Carpeta[]>(`${this.apiUrl}/path`, { params });
  }

  getPapeleria(): Observable<Carpeta[]> {
    return this.http.get<Carpeta[]>(`${this.apiUrl}/papeleria`);
  }

  getCarpetasByNombre(nombre: string): Observable<Carpeta[]> {
    return this.http.get<Carpeta[]>(`${this.apiUrl}/buscar/${nombre}`);
  }

  getCarpetaById(id: string): Observable<Carpeta> {
    return this.http.get<Carpeta>(`${this.apiUrl}/${id}`);
  }

  // --- MÉTODOS DE CREACIÓN Y EDICIÓN ---
  createCarpeta(carpeta: Partial<Carpeta>): Observable<any> {
    return this.http.post(this.apiUrl, { carpeta });
  }

  updateCarpeta(id: string, data: Partial<Carpeta>): Observable<any> {
    // Para actualizar, enviamos los datos directamente en el body
    return this.http.put(`${this.apiUrl}/${id}`, data);
  }

  // --- ESTADO Y ELIMINACIÓN ---
  cambiarEstadoCarpeta(id: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/cambiar-estado/${id}`, {});
  }

  eliminarCarpeta(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  // --- GESTIÓN DE PERMISOS (COMPARTIDO) ---
  compartirCarpeta(id: string, compartido: any[]): Observable<any> {
    return this.http.post(`${this.apiUrl}/compartir`, { id, compartido });
  }

  cambiarPermisoDeCompartido(id: string, compartido: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/cambiar-permiso`, { id, compartido });
  }

  eliminarCompartido(id: string, usuarioId: string): Observable<any> {
    // Angular requiere usar el objeto de opciones para enviar un body en un DELETE
    return this.http.delete(`${this.apiUrl}/eliminar-compartido`, {
      body: { id, usuarioId }
    });
  }

}
