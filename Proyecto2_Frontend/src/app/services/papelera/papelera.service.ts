import { inject, Injectable } from '@angular/core';
import { RestConstants } from '../../shared/restapi/rest-constants';
import { HttpClient, HttpParams } from '@angular/common/http';
import { PapeleraResponse } from '../../models/papeleria.models';
import { Observable } from 'rxjs';
import { Archivo } from '../../models/archivo.models';
import { Carpeta } from '../../models/carpeta.models';

@Injectable({
  providedIn: 'root',
})
export class PapeleraService {
  private http = inject(HttpClient);
  private restConstants = new RestConstants();
  private apiUrl = `${this.restConstants.getApiUrl()}papelera`;

  getPapeleraRaiz(): Observable<PapeleraResponse> {
    return this.http.get<PapeleraResponse>(this.apiUrl);
  }

  getArchivosPorPath(path: string): Observable<Archivo[]> {
    const params = new HttpParams().set('path', path);
    return this.http.get<Archivo[]>(`${this.apiUrl}/archivo`, { params });
  }

  getCarpetasPorPath(path: string): Observable<Carpeta[]> {
    const params = new HttpParams().set('path', path);
    return this.http.get<Carpeta[]>(`${this.apiUrl}/carpeta`, { params });
  }

}
