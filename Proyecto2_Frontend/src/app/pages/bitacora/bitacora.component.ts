import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { BitacoraService } from '../../services/bitacora/bitacora.service';
import { Bitacora } from '../../models/bitacora.model';

@Component({
  selector: 'app-bitacora.component',
  imports: [CommonModule],
  templateUrl: './bitacora.component.html'
})
export class BitacoraComponent implements OnInit {
  private bitacoraService = inject(BitacoraService);

  registros = signal<Bitacora[]>([]);
  cargando = signal<boolean>(true);
  error = signal<string | null>(null);

  ngOnInit(): void {
    this.cargarHistorial();
  }

  cargarHistorial(): void {
    this.cargando.set(true);
    this.bitacoraService.getHistorial().subscribe({
      next: (data) => {
        this.registros.set(data);
        this.cargando.set(false);
      },
      error: (err) => {
        console.error("Error al cargar la bitácora:", err);
        this.error.set('No se pudo cargar el historial de auditoría.');
        this.cargando.set(false);
      }
    });
  }
}