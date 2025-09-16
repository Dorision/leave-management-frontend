import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { LeaveRequestService } from '../services/leave-request.service';
import { AuthService } from '../../auth/services/auth.service';
import { 
  LeaveRequest, 
  LeaveType, 
  LeaveStatus, 
  LEAVE_TYPE_LABELS, 
  LEAVE_STATUS_LABELS,
  LEAVE_STATUS_BADGES,
  LeaveDecision,
  UserRole
} from '../../shared/models';

@Component({
  selector: 'app-leave-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './leave-detail.component.html',
  styleUrls: ['./leave-detail.component.css']
})
export class LeaveDetailComponent implements OnInit {
  leaveRequest: LeaveRequest | null = null;
  isLoading = false;
  errorMessage = '';
  isProcessing = false;
  actionType: 'approve' | 'reject' | 'retract' | '' = '';
  
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private leaveService: LeaveRequestService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadLeaveRequest();
    } else {
      this.errorMessage = 'Invalid leave request ID';
    }
  }

  loadLeaveRequest(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;

    this.isLoading = true;
    this.errorMessage = '';

    // In a real app, you might have a getLeaveRequestById method
    // For now, we'll try to find it in the user's requests or subordinate requests
    this.leaveService.getMyLeaveRequests().subscribe({
      next: (requests) => {
        const found = requests.find(r => r.id === id);
        if (found) {
          this.leaveRequest = found;
          this.isLoading = false;
        } else {
          // Try subordinate requests if user is a manager
          this.tryLoadFromSubordinateRequests(id);
        }
      },
      error: (error) => {
        this.tryLoadFromSubordinateRequests(id);
      }
    });
  }

  private tryLoadFromSubordinateRequests(id: string): void {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser?.role === UserRole.MANAGER || currentUser?.role === UserRole.HR || currentUser?.role === UserRole.ADMIN) {
      this.leaveService.getSubordinateLeaveRequests().subscribe({
        next: (requests) => {
          const found = requests.find(r => r.id === id);
          if (found) {
            this.leaveRequest = found;
          } else {
            this.errorMessage = 'Leave request not found';
          }
          this.isLoading = false;
        },
        error: (error) => {
          this.errorMessage = 'Failed to load leave request details';
          this.isLoading = false;
          console.error('Error loading leave request:', error);
        }
      });
    } else {
      this.errorMessage = 'Leave request not found';
      this.isLoading = false;
    }
  }

  goBack(): void {
    this.location.back();
  }

  editRequest(): void {
    if (this.leaveRequest) {
      this.router.navigate(['/leave-requests/edit', this.leaveRequest.id]);
    }
  }

  retractRequest(): void {
    if (!this.leaveRequest) return;

    if (confirm('Are you sure you want to retract this leave request? This action cannot be undone.')) {
      this.isProcessing = true;
      this.actionType = 'retract';

      this.leaveService.retractLeaveRequest(this.leaveRequest.id).subscribe({
        next: (updatedRequest) => {
          this.leaveRequest = updatedRequest;
          this.isProcessing = false;
          this.actionType = '';
        },
        error: (error) => {
          this.errorMessage = 'Failed to retract leave request. Please try again.';
          this.isProcessing = false;
          this.actionType = '';
          console.error('Error retracting leave request:', error);
        }
      });
    }
  }

  approveRequest(): void {
    if (!this.leaveRequest) return;

    const comments = prompt('Optional comments for approval:');
    this.makeDecision(LeaveStatus.APPROVED, comments || undefined, 'approve');
  }

  rejectRequest(): void {
    if (!this.leaveRequest) return;

    const comments = prompt('Please provide a reason for rejection (required):');
    if (!comments?.trim()) {
      alert('Comments are required when rejecting a request.');
      return;
    }
    
    this.makeDecision(LeaveStatus.REJECTED, comments, 'reject');
  }

  private makeDecision(status: LeaveStatus, comments: string | undefined, actionType: 'approve' | 'reject'): void {
    if (!this.leaveRequest) return;

    this.isProcessing = true;
    this.actionType = actionType;

    const decision: LeaveDecision = {
      status: status as LeaveStatus.APPROVED | LeaveStatus.REJECTED,
      managerComment: comments
    };

    this.leaveService.makeDecision(this.leaveRequest.id, decision).subscribe({
      next: (updatedRequest) => {
        this.leaveRequest = updatedRequest;
        this.isProcessing = false;
        this.actionType = '';
      },
      error: (error) => {
        this.errorMessage = `Failed to ${actionType} leave request. Please try again.`;
        this.isProcessing = false;
        this.actionType = '';
        console.error('Error making decision:', error);
      }
    });
  }

  // Permission checks
  isCurrentUserRequest(request: LeaveRequest): boolean {
    const currentUser = this.authService.getCurrentUser();
    return currentUser?.id === request.userId;
  }

  isManagerRequest(): boolean {
    const currentUser = this.authService.getCurrentUser();
    return currentUser?.role === UserRole.MANAGER || 
           currentUser?.role === UserRole.HR || 
           currentUser?.role === UserRole.ADMIN;
  }

  canEdit(request: LeaveRequest): boolean {
    return this.isCurrentUserRequest(request) && request.status === LeaveStatus.PENDING;
  }

  canRetract(request: LeaveRequest): boolean {
    return this.isCurrentUserRequest(request) && request.status === LeaveStatus.PENDING;
  }

  // Helper methods
  getEmployeeName(request: LeaveRequest): string {
    if (request.user) {
      return `${request.user.firstName || ''} ${request.user.lastName || ''}`.trim();
    }
    return 'Unknown Employee';
  }

  getLeaveTypeLabel(type: LeaveType): string {
    return LEAVE_TYPE_LABELS[type] || type;
  }

  getStatusLabel(status: LeaveStatus): string {
    return LEAVE_STATUS_LABELS[status] || status;
  }

  getStatusBadgeClass(status: LeaveStatus): string {
    return LEAVE_STATUS_BADGES[status] || 'bg-secondary';
  }

  getStatusAlertClass(status: LeaveStatus): string {
    switch (status) {
      case LeaveStatus.PENDING: return 'warning';
      case LeaveStatus.APPROVED: return 'success';
      case LeaveStatus.REJECTED: return 'danger';
      case LeaveStatus.CANCELLED: return 'secondary';
      default: return 'info';
    }
  }

  getStatusIcon(status: LeaveStatus): string {
    switch (status) {
      case LeaveStatus.PENDING: return 'fa-clock';
      case LeaveStatus.APPROVED: return 'fa-check-circle';
      case LeaveStatus.REJECTED: return 'fa-times-circle';
      case LeaveStatus.CANCELLED: return 'fa-ban';
      default: return 'fa-info-circle';
    }
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  }
}