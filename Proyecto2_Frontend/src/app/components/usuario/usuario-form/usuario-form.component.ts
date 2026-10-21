import { Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Usuario } from '../../../models/usuario.model';

@Component({
  selector: 'app-usuario-form',
  imports: [ReactiveFormsModule],
  templateUrl: './usuario-form.component.html'
})
export class UsuarioFormComponent implements OnInit {
  private fb = inject(FormBuilder);

  @Input() usuarioAEditar: Usuario | null = null;
  @Input() backendError: string | null = null;

  @Output() formSubmit = new EventEmitter<Partial<Usuario>>();
  @Output() formCancel = new EventEmitter<void>();

  usuarioForm!: FormGroup;

  ngOnInit(): void {
    const passwordValidators = this.usuarioAEditar ? [] : [Validators.required];

    this.usuarioForm = this.fb.group({
      nombre: [this.usuarioAEditar?.nombre || '', Validators.required],
      email: [this.usuarioAEditar?.email || '', [Validators.required, Validators.email]],
      password: ['', passwordValidators],
      rol: [this.usuarioAEditar?.rol || 'usuario', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.usuarioForm.valid) {
      this.formSubmit.emit(this.usuarioForm.value);
    } else {
      this.usuarioForm.markAllAsTouched();
    }
  }

  onCancel(): void {
    this.formCancel.emit();
  }
}