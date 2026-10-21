import { inject, Injectable } from '@angular/core';
import { RestConstants } from '../../shared/restapi/rest-constants';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Bitacora } from '../../models/bitacora.model';

@Injectable({
  providedIn: 'root',
})
export class BitacoraService {
  private http = inject(HttpClient);
  private restConstants = new RestConstants();
  private apiUrl = `${this.restConstants.getApiUrl()}bitacora`;

  getHistorial(): Observable<Bitacora[]> {
    return this.http.get<Bitacora[]>(this.apiUrl);
  }
}
