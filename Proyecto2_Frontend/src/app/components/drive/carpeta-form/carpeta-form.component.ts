import { Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Carpeta } from '../../../models/carpeta.models';

@Component({
  selector: 'app-carpeta-form',
  imports: [ReactiveFormsModule],
  templateUrl: './carpeta-form.component.html'
})
export class CarpetaFormComponent implements OnInit {
  private fb = inject(FormBuilder);

  @Input() carpetaAEditar: Carpeta | null = null;
  @Input() backendError: string | null = null;

  @Output() formSubmit = new EventEmitter<{ nombre: string }>();
  @Output() formCancel = new EventEmitter<void>();

  carpetaForm!: FormGroup;

  ngOnInit(): void {
    this.carpetaForm = this.fb.group({
      nombre: [this.carpetaAEditar?.nombre || '', [Validators.required, Validators.pattern(/^[a-zA-Z0-9_\-\s]+$/)]]
    });
  }

  onSubmit(): void {
    if (this.carpetaForm.valid) {
      this.formSubmit.emit(this.carpetaForm.value);
    } else {
      this.carpetaForm.markAllAsTouched();
    }
  }
}