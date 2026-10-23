import { inject, Injectable } from '@angular/core';
import { RestConstants } from '../../shared/restapi/rest-constants';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CompartidoResponse } from '../../models/compartido.models';

@Injectable({
  providedIn: 'root',
})
export class CompartidoService {
  private http = inject(HttpClient);
  private restConstants = new RestConstants();
  private apiUrl = `${this.restConstants.getApiUrl()}compartido`;

  getCompartidosConmigo(): Observable<CompartidoResponse> {
    return this.http.get<CompartidoResponse>(this.apiUrl);
  }
}
