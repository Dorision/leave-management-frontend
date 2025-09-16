import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../auth/services/auth.service';
import { LeaveService } from '../../shared/services/leave.service';
import { AuthUser, LeaveRequest, LeaveBalance } from '../../shared/models';

@Component({
  selector: 'app-employee-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './employee-dashboard.component.html',
  styleUrl: './employee-dashboard.component.css'
})
export class EmployeeDashboardComponent implements OnInit {
  currentUser: AuthUser | null = null;
  isLoading = true;
  recentRequests: LeaveRequest[] = [];
  stats = {
    pendingRequests: 0,
    approvedRequests: 0,
    usedDays: 0,
    remainingDays: 0
  };

  constructor(
    private authService: AuthService,
    private leaveService: LeaveService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.loadDashboardData();
  }

  private async loadDashboardData(): Promise<void> {
    try {
      this.isLoading = true;
      
      // Load recent requests (simulated for now)
      this.recentRequests = [];
      
      // Calculate stats (simulated for now)
      this.stats = {
        pendingRequests: 2,
        approvedRequests: 5,
        usedDays: 12,
        remainingDays: 8
      };
      
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      this.isLoading = false;
    }
  }

  getLeaveTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      'ANNUAL': 'Annual Leave',
      'SICK': 'Sick Leave',
      'MATERNITY': 'Maternity Leave',
      'PATERNITY': 'Paternity Leave',
      'STUDY': 'Study Leave',
      'FAMILY_RESPONSIBILITY': 'Family Responsibility',
      'UNPAID': 'Unpaid Leave'
    };
    return labels[type] || type;
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      'PENDING': 'Pending',
      'APPROVED': 'Approved',
      'REJECTED': 'Rejected',
      'CANCELLED': 'Cancelled'
    };
    return labels[status] || status;
  }

  getStatusBadgeClass(status: string): string {
    const classes: Record<string, string> = {
      'PENDING': 'bg-warning text-dark',
      'APPROVED': 'bg-success',
      'REJECTED': 'bg-danger',
      'CANCELLED': 'bg-secondary'
    };
    return classes[status] || 'bg-secondary';
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }
}