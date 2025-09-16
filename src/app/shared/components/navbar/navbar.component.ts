import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../auth/services/auth.service';
import { NotificationService } from '../../services/notification.service';
import { AuthUser, UserRole } from '../../models';

interface NavItem {
  label: string;
  route: string;
  icon: string;
  roles: UserRole[];
  children?: NavItem[];
}

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent implements OnInit {
  currentUser: AuthUser | null = null;
  navItems: NavItem[] = [];

  private readonly employeeNavItems: NavItem[] = [
    {
      label: 'Dashboard',
      route: '/employee',
      icon: 'fas fa-tachometer-alt',
      roles: [UserRole.EMPLOYEE]
    },
    {
      label: 'My Leave Requests',
      route: '/employee/leave-requests',
      icon: 'fas fa-calendar-alt',
      roles: [UserRole.EMPLOYEE],
      children: [
        {
          label: 'View All',
          route: '/employee/leave-requests',
          icon: 'fas fa-list',
          roles: [UserRole.EMPLOYEE]
        },
        {
          label: 'Create New',
          route: '/employee/leave-requests/create',
          icon: 'fas fa-plus',
          roles: [UserRole.EMPLOYEE]
        }
      ]
    },
    {
      label: 'Public Holidays',
      route: '/public-holidays',
      icon: 'fas fa-star',
      roles: [UserRole.EMPLOYEE]
    }
  ];

  private readonly managerNavItems: NavItem[] = [
    {
      label: 'Dashboard',
      route: '/manager',
      icon: 'fas fa-tachometer-alt',
      roles: [UserRole.MANAGER, UserRole.HR, UserRole.ADMIN]
    },
    {
      label: 'Leave Management',
      route: '/manager/leave-requests',
      icon: 'fas fa-tasks',
      roles: [UserRole.MANAGER, UserRole.HR, UserRole.ADMIN],
      children: [
        {
          label: 'Pending Approvals',
          route: '/manager/leave-requests',
          icon: 'fas fa-clock',
          roles: [UserRole.MANAGER, UserRole.HR, UserRole.ADMIN]
        },
        {
          label: 'All Requests',
          route: '/manager/leave-requests?status=all',
          icon: 'fas fa-list',
          roles: [UserRole.MANAGER, UserRole.HR, UserRole.ADMIN]
        }
      ]
    },
    {
      label: 'Team Calendar',
      route: '/manager/team',
      icon: 'fas fa-calendar',
      roles: [UserRole.MANAGER, UserRole.HR, UserRole.ADMIN]
    },
    {
      label: 'Reports',
      route: '/manager/reports',
      icon: 'fas fa-chart-bar',
      roles: [UserRole.MANAGER, UserRole.HR, UserRole.ADMIN]
    },
    {
      label: 'Public Holidays',
      route: '/public-holidays',
      icon: 'fas fa-star',
      roles: [UserRole.MANAGER, UserRole.HR, UserRole.ADMIN]
    }
  ];

  constructor(
    private authService: AuthService,
    private router: Router,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      this.updateNavItems();
    });
  }

  private updateNavItems(): void {
    if (!this.currentUser) {
      this.navItems = [];
      return;
    }

    switch (this.currentUser.role) {
      case UserRole.EMPLOYEE:
        this.navItems = this.employeeNavItems;
        break;
      case UserRole.MANAGER:
      case UserRole.HR:
      case UserRole.ADMIN:
        this.navItems = this.managerNavItems;
        break;
      default:
        this.navItems = [];
    }
  }

  hasPermission(roles: UserRole[]): boolean {
    if (!this.currentUser) return false;
    return roles.includes(this.currentUser.role);
  }

  getRoleLabel(role: UserRole): string {
    const labels = {
      [UserRole.EMPLOYEE]: 'Employee',
      [UserRole.MANAGER]: 'Manager',
      [UserRole.HR]: 'HR',
      [UserRole.ADMIN]: 'Administrator'
    };
    return labels[role] || role;
  }

  getProfileRoute(): string {
    if (!this.currentUser) return '/login';
    
    return this.currentUser.role === UserRole.EMPLOYEE 
      ? '/employee/profile' 
      : '/manager/profile';
  }

  changePassword(event: Event): void {
    event.preventDefault();
    // TODO: Implement change password functionality
    this.notificationService.info('Coming Soon', 'Change password functionality will be available soon');
  }

  logout(event: Event): void {
    event.preventDefault();
    this.authService.logout();
    this.notificationService.success('Logged Out', 'You have been successfully logged out');
    this.router.navigate(['/login']);
  }
}