import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-mover-form',
  imports: [FormsModule],
  templateUrl: './mover-form.component.html'
})
export class MoverFormComponent {
  @Input() nombreRecurso: string = '';
  @Input() pathActual: string = '/';
  @Input() backendError: string | null = null;

  @Output() formSubmit = new EventEmitter<string>();
  @Output() formCancel = new EventEmitter<void>();

  nuevoPath: string = '';

  ngOnInit() {
    this.nuevoPath = this.pathActual;
  }

  onSubmit() {
    // Aseguramos que empiece y termine con '/'
    let path = this.nuevoPath.trim();
    if (!path.startsWith('/')) path = '/' + path;
    if (!path.endsWith('/')) path = path + '/';

    this.formSubmit.emit(path);
  }
}