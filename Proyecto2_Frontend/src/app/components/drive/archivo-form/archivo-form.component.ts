import { Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Archivo } from '../../../models/archivo.models';

@Component({
  selector: 'app-archivo-form',
  imports: [ReactiveFormsModule],
  templateUrl: './archivo-form.component.html'
})
export class ArchivoFormComponent implements OnInit {
  private fb = inject(FormBuilder);

  @Input() archivoAEditar: Archivo | null = null;
  @Input() backendError: string | null = null;

  // Emitimos FormData porque incluye el archivo físico y el nombre
  @Output() formSubmit = new EventEmitter<{ nombre: string, archivoFisico?: File }>();
  @Output() formCancel = new EventEmitter<void>();

  // Modo del formulario: 'crear' para subir un nuevo archivo, 'actualizar-contenido' para reemplazar el contenido de un archivo existente
  @Input() modo: 'crear' | 'actualizar-contenido' | 'renombrar' = 'crear';

  archivoForm!: FormGroup;
  archivoSeleccionado: File | null = null;

  ngOnInit(): void {
    const validadoresNombre = (this.modo === 'crear' || this.modo === 'renombrar') ? [Validators.required] : [];

    this.archivoForm = this.fb.group({
      nombre: [this.archivoAEditar?.nombre || '', validadoresNombre]
    });
  }

  onFileChange(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.archivoSeleccionado = file;
      // Si el input de nombre está vacío, le sugerimos el nombre del archivo original
      if (!this.archivoForm.get('nombre')?.value) {
        const nombreSinExt = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
        this.archivoForm.get('nombre')?.setValue(nombreSinExt);
      }
    }
  }

  onSubmit(): void {
    if (this.archivoForm.valid) {
      if ((this.modo === 'crear' || this.modo === 'actualizar-contenido') && !this.archivoSeleccionado) {
        this.archivoForm.markAllAsTouched();
        return;
      }
      this.formSubmit.emit({
        nombre: this.archivoForm.value.nombre,
        archivoFisico: this.archivoSeleccionado || undefined
      });
    } else {
      this.archivoForm.markAllAsTouched();
    }
  }
}