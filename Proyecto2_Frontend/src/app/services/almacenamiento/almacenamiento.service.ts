import { inject, Injectable } from '@angular/core';
import { RestConstants } from '../../shared/restapi/rest-constants';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { AlmacenamientoResponse } from '../../models/almacenamiento.models';

@Injectable({
  providedIn: 'root',
})
export class AlmacenamientoService {
  private http = inject(HttpClient);
  private restConstants = new RestConstants();
  private apiUrl = `${this.restConstants.getApiUrl()}almacenamiento`;

  private actualizacionSubject = new Subject<void>();
  actualizacion$ = this.actualizacionSubject.asObservable();

  // NUEVO: Método que llamarán los otros componentes para avisar que hubo un cambio
  notificarActualizacion() {
    this.actualizacionSubject.next();
  }

  getEstadoAlmacenamiento(): Observable<AlmacenamientoResponse> {
    return this.http.get<AlmacenamientoResponse>(this.apiUrl);
  }

  // Para cuando el admin quiera cambiar el límite
  actualizarLimiteGlobal(nuevoLimite: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/actualizar-limite`, { nuevoLimite });
  }
}
