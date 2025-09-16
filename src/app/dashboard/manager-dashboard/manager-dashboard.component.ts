import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../auth/services/auth.service';
import { LeaveService } from '../../shared/services/leave.service';
import { AuthUser, LeaveRequest } from '../../shared/models';

@Component({
  selector: 'app-manager-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './manager-dashboard.component.html',
  styleUrl: './manager-dashboard.component.css'
})
export class ManagerDashboardComponent implements OnInit {
  currentUser: AuthUser | null = null;
  isLoading = true;
  pendingRequests: LeaveRequest[] = [];
  stats = {
    pendingApprovals: 0,
    teamMembers: 0,
    onLeaveToday: 0,
    thisMonthRequests: 0
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
      
      // Load pending requests (simulated for now)
      this.pendingRequests = [];
      
      // Calculate stats (simulated for now)
      this.stats = {
        pendingApprovals: 3,
        teamMembers: 12,
        onLeaveToday: 2,
        thisMonthRequests: 8
      };
      
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      this.isLoading = false;
    }
  }

  getEmployeeName(request: LeaveRequest): string {
    if (request.user) {
      return `${request.user.firstName} ${request.user.lastName}`;
    }
    return 'Unknown Employee';
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

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }

  quickApprove(request: LeaveRequest): void {
    // TODO: Implement quick approve functionality
    console.log('Quick approve:', request);
  }

  quickReject(request: LeaveRequest): void {
    // TODO: Implement quick reject functionality
    console.log('Quick reject:', request);
  }
}