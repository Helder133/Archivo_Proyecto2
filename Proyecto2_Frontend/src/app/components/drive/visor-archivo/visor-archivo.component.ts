import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, signal } from '@angular/core';

@Component({
  selector: 'app-visor-archivo',
  imports: [CommonModule],
  templateUrl: './visor-archivo.component.html'
})
export class VisorArchivoComponent implements OnChanges {
  @Input({ required: true }) nombre!: string;
  @Input({ required: true }) tipo!: string;
  @Input() blobData: Blob | null = null;
  @Output() cerrar = new EventEmitter<void>();

  contenido = signal<string>('');
  cargando = signal<boolean>(false);
  error = signal<boolean>(false);

  ngOnChanges(): void {
    if (this.blobData) {
      this.leerArchivo(this.blobData);
    }
  }

  private leerArchivo(blob: Blob) {
    this.cargando.set(true);
    this.error.set(false);

    // Función nativa del navegador para extraer texto de un Blob
    blob.text()
      .then(texto => {
        this.contenido.set(texto);
        this.cargando.set(false);
      })
      .catch(() => {
        this.error.set(true);
        this.cargando.set(false);
      });
  }
}