import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { AdminLayoutComponent } from './layouts/admin-layout/admin-layout.component';
import { UsuariosComponent } from './pages/usuarios/usuarios.component';
import { ReportesComponent } from './pages/reportes/reportes.component';
import { BitacoraComponent } from './pages/bitacora/bitacora.component';

export const routes: Routes = [
    {
        path: 'login',
        component: LoginComponent
    },
    {
        path: 'admin',
        component: AdminLayoutComponent,
        children: [
            { path: '', redirectTo: 'usuarios', pathMatch: 'full' },
            { path: 'usuarios', component: UsuariosComponent },
            { path: 'reportes', component: ReportesComponent },
            { path: 'bitacora', component: BitacoraComponent }
        ]
    },
    {
        path: 'usuario',
        component: AdminLayoutComponent,
        children: [
            { path: '', redirectTo: 'mi-unidad', pathMatch: 'full' },
            { path: 'mi-unidad', loadComponent: () => import('./pages/mi-unidad/mi-unidad.component').then(m => m.MiUnidadComponent) },
            { path: 'compartido', loadComponent: () => import('./pages/compartido/compartido.component').then(m => m.CompartidoComponent) },
            { path: 'papelera', loadComponent: () => import('./pages/papelera/papelera.component').then(m => m.PapeleraComponent) }

        ]
    },
    { path: '', redirectTo: 'login', pathMatch: 'full' },
    { path: '**', redirectTo: 'login' }
];
