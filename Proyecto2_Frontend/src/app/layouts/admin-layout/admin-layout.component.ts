import { Component } from '@angular/core';
import { SidebarComponent } from '../../components/sidebar/sidebar/sidebar.component';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-admin-layout',
  imports: [RouterOutlet, SidebarComponent],
  templateUrl: './admin-layout.component.html'
})
export class AdminLayoutComponent {}
