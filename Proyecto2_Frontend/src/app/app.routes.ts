import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { AdminLayoutComponent } from './layouts/admin-layout/admin-layout.component';
import { UsuariosComponent } from './pages/usuarios/usuarios.component';

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

            // Aquí agregarás los demás componentes cuando los crees
            // { path: 'reportes', component: ReportesComponent },
            // { path: 'bitacora', component: BitacoraComponent }
        ]
    },

    { path: '', redirectTo: 'login', pathMatch: 'full' },
    { path: '**', redirectTo: 'login' }
];
