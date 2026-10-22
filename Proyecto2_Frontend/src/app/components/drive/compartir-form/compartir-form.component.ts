import { Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Usuario } from '../../../models/usuario.model';
import { Colaborador } from '../../../models/archivo.models';

@Component({
  selector: 'app-compartir-form',
  imports: [ReactiveFormsModule],
  templateUrl: './compartir-form.component.html'
})
export class CompartirFormComponent implements OnInit {
  private fb = inject(FormBuilder);

  @Input({ required: true }) usuariosDisponibles: Usuario[] = [];
  @Input({ required: true }) nombreRecurso: string = '';
  @Input() colaboradoresActuales: Colaborador[] = [];
  @Input() backendError: string | null = null;

  // Emitimos un arreglo porque tu backend espera "compartido: [{ usuarioId, permiso }]"
  @Output() formSubmit = new EventEmitter<any[]>();
  @Output() formCancel = new EventEmitter<void>();

  // <-- eventos para cambiar permisos y revocar acceso -->
  @Output() cambiarPermiso = new EventEmitter<{ usuarioId: string, permiso: string }>();
  @Output() revocarAcceso = new EventEmitter<string>();

  compartirForm!: FormGroup;

  ngOnInit(): void {
    this.compartirForm = this.fb.group({
      usuarioId: ['', Validators.required],
      permiso: ['lectura', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.compartirForm.valid) {
      const datosCompartir = [this.compartirForm.value];
      this.formSubmit.emit(datosCompartir);
    } else {
      this.compartirForm.markAllAsTouched();
    }
  }

  onCambiarPermiso(usuarioId: string, event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    this.cambiarPermiso.emit({ usuarioId, permiso: selectElement.value });
  }

  onRevocar(usuarioId: string) {
    this.revocarAcceso.emit(usuarioId);
  }

}