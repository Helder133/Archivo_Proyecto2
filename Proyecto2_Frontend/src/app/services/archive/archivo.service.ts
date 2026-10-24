import { inject, Injectable } from '@angular/core';
import { RestConstants } from '../../shared/restapi/rest-constants';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Archivo } from '../../models/archivo.models';

@Injectable({
  providedIn: 'root',
})
export class ArchivoService {
  private http = inject(HttpClient);
  private restConstants = new RestConstants();
  private apiUrl = `${this.restConstants.getApiUrl()}archivo`;

  getArchivosByPath(path: string): Observable<Archivo[]> {
    const params = new HttpParams().set('path', path);
    return this.http.get<Archivo[]>(`${this.apiUrl}/path`, { params });
  }

  createArchivo(archivoData: Partial<Archivo>, archivoFisico: File): Observable<any> {
    // Como backend usa multer, necesitamos armar un FormData
    const formData = new FormData();
    formData.append('archivoFisico', archivoFisico);
    formData.append('nombre', archivoData.nombre || '');
    formData.append('path', archivoData.path || '/');
    formData.append('usuarioId', archivoData.usuarioId || ''); // Aunque el backend lo sobrescribirá con el token

    return this.http.post(this.apiUrl, formData);
  }

  getAllArchivos(): Observable<Archivo[]> {
    return this.http.get<Archivo[]>(this.apiUrl);
  }

  getPapeleria(): Observable<Archivo[]> {
    return this.http.get<Archivo[]>(`${this.apiUrl}/papeleria`);
  }

  getArchivosByNombre(nombre: string): Observable<Archivo[]> {
    return this.http.get<Archivo[]>(`${this.apiUrl}/buscar/${nombre}`);
  }

  getArchivosByExtension(ext: string): Observable<Archivo[]> {
    return this.http.get<Archivo[]>(`${this.apiUrl}/extension/${ext}`);
  }

  getArchivoById(id: string): Observable<Archivo> {
    return this.http.get<Archivo>(`${this.apiUrl}/${id}`);
  }

  // --- DESCARGA DE ARCHIVOS ---

  descargarArchivo(id: string): Observable<Blob> {
    // Es VITAL pedir responseType: 'blob' para manejar archivos binarios en Angular
    return this.http.get(`${this.apiUrl}/descargar/${id}`, { responseType: 'blob' });
  }

  // --- EDICIÓN Y ESTADO ---

  actualizarContenido(id: string, archivoFisico: File): Observable<any> {
    const formData = new FormData();
    formData.append('archivoFisico', archivoFisico);
    
    return this.http.put(`${this.apiUrl}/contenido/${id}`, formData);
  }

  renombrarArchivo(id: string, nombre: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/renombrar/${id}`, { nombre });
  }

  cambiarEstadoArchivo(id: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/cambiar-estado/${id}`, {});
  }

  eliminarArchivo(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  moverArchivo(id: string, nuevoPathDestino: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/mover/${id}`, { nuevoPathDestino });
  }

  // --- GESTIÓN DE PERMISOS (COMPARTIDO) ---

  compartirArchivo(id: string, compartido: any[]): Observable<any> {
    return this.http.post(`${this.apiUrl}/compartir`, { id, compartido });
  }

  cambiarPermisoDeCompartido(id: string, compartido: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/cambiar-permiso`, { id, compartido });
  }

  eliminarCompartido(id: string, usuarioId: string): Observable<any> {
    // Para enviar un body en una petición DELETE en Angular, se usa el objeto "options"
    return this.http.delete(`${this.apiUrl}/eliminar-compartido`, {
      body: { id, usuarioId }
    });
  }

}
