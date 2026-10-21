import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { ColumnaTabla } from '../../../models/reporte.model';

@Component({
  selector: 'app-reporte-tabla',
  imports: [CommonModule],
  templateUrl: './reporte-tabla.component.html'
})
export class ReporteTablaComponent {
  @Input({ required: true }) datos: any[] = [];
  @Input({ required: true }) columnas: ColumnaTabla[] = [];
}
