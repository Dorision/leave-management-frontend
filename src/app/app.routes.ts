import { Routes } from '@angular/router';
import { authGuard } from './shared/guards/auth.guard';
import { employeeGuard, managerGuard } from './shared/guards/role.guard';

export const routes: Routes = [
  { 
    path: '', 
    redirectTo: '/login', 
    pathMatch: 'full' 
  },
  {
    path: 'login',
    loadComponent: () => import('./auth/login/login.component').then(c => c.LoginComponent)
  },
  {
    path: 'employee',
    canActivate: [authGuard, employeeGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./dashboard/employee-dashboard/employee-dashboard.component').then(c => c.EmployeeDashboardComponent)
      },
      {
        path: 'leave-requests',
        children: [
          {
            path: '',
            loadComponent: () => import('./leave-requests/leave-list/leave-list.component').then(c => c.LeaveListComponent)
          },
          {
            path: 'create',
            loadComponent: () => import('./leave-requests/leave-create/leave-create.component').then(c => c.LeaveCreateComponent)
          },
          {
            path: 'edit/:id',
            loadComponent: () => import('./leave-requests/leave-edit/leave-edit.component').then(c => c.LeaveEditComponent)
          },
          {
            path: ':id',
            loadComponent: () => import('./leave-requests/leave-detail/leave-detail.component').then(c => c.LeaveDetailComponent)
          }
        ]
      },
      {
        path: 'profile',
        loadComponent: () => import('./shared/components/profile/profile.component').then(c => c.ProfileComponent)
      }
    ]
  },
  {
    path: 'manager',
    canActivate: [authGuard, managerGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./dashboard/manager-dashboard/manager-dashboard.component').then(c => c.ManagerDashboardComponent)
      },
      {
        path: 'leave-requests',
        children: [
          {
            path: '',
            loadComponent: () => import('./leave-requests/leave-approval/leave-approval.component').then(c => c.LeaveApprovalComponent)
          },
          {
            path: ':id',
            loadComponent: () => import('./leave-requests/leave-detail/leave-detail.component').then(c => c.LeaveDetailComponent)
          }
        ]
      }
    ]
  },
  {
    path: 'unauthorized',
    loadComponent: () => import('./shared/components/unauthorized/unauthorized.component').then(c => c.UnauthorizedComponent)
  },
  { 
    path: '**', 
    loadComponent: () => import('./shared/components/not-found/not-found.component').then(c => c.NotFoundComponent)
  }
];
