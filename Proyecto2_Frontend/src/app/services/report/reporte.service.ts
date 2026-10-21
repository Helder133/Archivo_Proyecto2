import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { RestConstants } from '../../shared/restapi/rest-constants';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ReporteService {
  private http = inject(HttpClient);
  private restConstants = new RestConstants();
  private apiUrl = `${this.restConstants.getApiUrl()}reporte`;

  // --- ARCHIVOS ---
  getCantidadArchivosPorTipo(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/archivos/tipo`);
  }

  getArchivosPorRangoFechas(inicio: string, fin: string): Observable<any[]> {
    const params = new HttpParams().set('inicio', inicio).set('fin', fin);
    return this.http.get<any[]>(`${this.apiUrl}/archivos/rango-fechas`, { params });
  }

  getArchivosConMasOperaciones(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/archivos/mas-operaciones`);
  }

  // --- USUARIOS ---
  getTopUsuariosMasArchivos(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/usuarios/top-archivos`);
  }
  getUsuariosMasRecursosCompartidos(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/usuarios/top-comparten`);
  }

  // --- COMPARTICIÓN ---
  getArchivosCompartidosConMasUsuarios(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/compartido/mas-usuarios`);
  }
  getRecursosCompartidosPorUsuario(usuarioId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/compartido/enviados/${usuarioId}`);
  }
  getRecursosRecibidosPorUsuario(usuarioId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/compartido/recibidos/${usuarioId}`);
  }

  // --- ACTIVIDAD ---
  getHistorialUsuarioFechas(usuarioId: string, inicio: string, fin: string): Observable<any[]> {
    const params = new HttpParams().set('inicio', inicio).set('fin', fin);
    return this.http.get<any[]>(`${this.apiUrl}/actividad/usuario/${usuarioId}/rango`, { params });
  }
  getOperacionesPorTipo(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/actividad/operaciones-tipo`);
  }
  getOperacionesPorPeriodo(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/actividad/operaciones-periodo`);
  }
  getPrincipalesAccionesSistema(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/actividad/principales`);
  }
}
