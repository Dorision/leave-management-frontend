import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../auth/services/auth.service';
import { LeaveService } from '../../shared/services/leave.service';
import { AuthUser, LeaveRequest, LeaveBalance } from '../../shared/models';
import { getLeaveTypeLabel, getStatusLabel, getStatusBadgeClass, formatDate } from '../../shared/utils/type-helpers.util';

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

  // Use utility functions for type-safe operations
  getLeaveTypeLabel = getLeaveTypeLabel;
  getStatusLabel = getStatusLabel;
  getStatusBadgeClass = getStatusBadgeClass;
  formatDate = formatDate;
}