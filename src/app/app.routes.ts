import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./components/dashboard/dashboard.component').then(
        (m) => m.DashboardComponent
      ),
  },
  {
    path: 'user/:id',
    loadComponent: () =>
      import('./components/user-detail/user-detail.component').then(
        (m) => m.UserDetailComponent
      ),
  },
  { path: '**', redirectTo: 'dashboard' },
];
