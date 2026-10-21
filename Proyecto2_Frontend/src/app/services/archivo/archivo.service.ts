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

}
