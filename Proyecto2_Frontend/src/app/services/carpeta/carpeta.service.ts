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

  getCarpetasByPath(path: string): Observable<Carpeta[]> {
    const params = new HttpParams().set('path', path);
    return this.http.get<Carpeta[]>(`${this.apiUrl}/path`, { params });
  }

  createCarpeta(carpeta: Partial<Carpeta>): Observable<any> {
    return this.http.post(this.apiUrl, { carpeta });
  }

}
