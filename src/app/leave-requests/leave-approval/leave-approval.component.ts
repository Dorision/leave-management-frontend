import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LeaveRequestService } from '../services/leave-request.service';
import { 
  LeaveRequest, 
  LeaveType, 
  LeaveStatus, 
  LEAVE_TYPE_LABELS, 
  LEAVE_STATUS_LABELS,
  LEAVE_STATUS_BADGES,
  LeaveDecision
} from '../../shared/models';

@Component({
  selector: 'app-leave-approval',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './leave-approval.component.html',
  styleUrls: ['./leave-approval.component.css']
})
export class LeaveApprovalComponent implements OnInit {
  leaveRequests: LeaveRequest[] = [];
  filteredRequests: LeaveRequest[] = [];
  paginatedRequests: LeaveRequest[] = [];
  
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  isProcessing = false;
  
  // Filters
  selectedStatus = '';
  selectedType = '';
  searchTerm = '';
  sortBy = 'submitted';
  
  // Pagination
  currentPage = 1;
  itemsPerPage = 8;
  totalPages = 0;
  
  // Options for dropdowns
  statusOptions = Object.entries(LEAVE_STATUS_LABELS).map(([value, label]) => ({ value, label }));
  leaveTypes = Object.entries(LEAVE_TYPE_LABELS).map(([value, label]) => ({ value, label }));
  
  // Statistics
  pendingCount = 0;
  approvedCount = 0;
  rejectedCount = 0;
  totalRequests = 0;
  
  // Decision Modal
  selectedRequest: LeaveRequest | null = null;
  decisionType: 'APPROVED' | 'REJECTED' = 'APPROVED';
  managerComment = '';

  constructor(
    private leaveService: LeaveRequestService
  ) {}

  ngOnInit(): void {
    this.loadLeaveRequests();
  }

  loadLeaveRequests(): void {
    this.isLoading = true;
    this.errorMessage = '';
    
    this.leaveService.getSubordinateLeaveRequests().subscribe({
      next: (requests) => {
        this.leaveRequests = requests;
        this.calculateStatistics();
        this.sortRequests();
        this.filterRequests();
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Failed to load leave requests. Please try again.';
        this.isLoading = false;
        console.error('Error loading leave requests:', error);
      }
    });
  }

  private calculateStatistics(): void {
    this.totalRequests = this.leaveRequests.length;
    this.pendingCount = this.leaveRequests.filter(r => r.status === LeaveStatus.PENDING).length;
    this.approvedCount = this.leaveRequests.filter(r => r.status === LeaveStatus.APPROVED).length;
    this.rejectedCount = this.leaveRequests.filter(r => r.status === LeaveStatus.REJECTED).length;
  }

  filterRequests(): void {
    this.filteredRequests = this.leaveRequests.filter(request => {
      const matchesStatus = !this.selectedStatus || request.status === this.selectedStatus;
      const matchesType = !this.selectedType || request.leaveType === this.selectedType;
      const employeeName = this.getEmployeeName(request).toLowerCase();
      const matchesSearch = !this.searchTerm || 
        employeeName.includes(this.searchTerm.toLowerCase()) ||
        (request.user?.email?.toLowerCase().includes(this.searchTerm.toLowerCase()));
      
      return matchesStatus && matchesType && matchesSearch;
    });
    
    this.currentPage = 1;
    this.updatePagination();
  }

  sortRequests(): void {
    this.leaveRequests.sort((a, b) => {
      switch (this.sortBy) {
        case 'submitted':
          return new Date(b.submittedAt || '').getTime() - new Date(a.submittedAt || '').getTime();
        case 'startDate':
          return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
        case 'employee':
          return this.getEmployeeName(a).localeCompare(this.getEmployeeName(b));
        default:
          return 0;
      }
    });
    this.filterRequests();
  }

  private updatePagination(): void {
    this.totalPages = Math.ceil(this.filteredRequests.length / this.itemsPerPage);
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedRequests = this.filteredRequests.slice(startIndex, endIndex);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePagination();
    }
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxPages = 5;
    let start = Math.max(1, this.currentPage - Math.floor(maxPages / 2));
    let end = Math.min(this.totalPages, start + maxPages - 1);
    
    if (end - start < maxPages - 1) {
      start = Math.max(1, end - maxPages + 1);
    }
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    
    return pages;
  }

  clearFilters(): void {
    this.selectedStatus = '';
    this.selectedType = '';
    this.searchTerm = '';
    this.filterRequests();
  }

  openDecisionModal(request: LeaveRequest, decision: 'APPROVED' | 'REJECTED'): void {
    this.selectedRequest = request;
    this.decisionType = decision;
    this.managerComment = '';
    // In a real app, you'd use a modal service or bootstrap modal
    // For now, we'll show a confirm dialog
    if (decision === 'APPROVED') {
      this.managerComment = prompt('Optional comments for approval:') || '';
      this.confirmDecision();
    } else {
      this.managerComment = prompt('Please provide a reason for rejection (required):') || '';
      if (this.managerComment.trim()) {
        this.confirmDecision();
      }
    }
  }

  confirmDecision(): void {
    if (!this.selectedRequest) return;
    
    if (this.decisionType === 'REJECTED' && !this.managerComment?.trim()) {
      alert('Comments are required when rejecting a request.');
      return;
    }
    
    this.isProcessing = true;
    
    const decision: LeaveDecision = {
      status: this.decisionType === 'APPROVED' ? LeaveStatus.APPROVED : LeaveStatus.REJECTED,
      managerComment: this.managerComment?.trim() || undefined
    };
    
    this.leaveService.makeDecision(this.selectedRequest.id, decision).subscribe({
      next: (updatedRequest) => {
        // Update the request in our local array
        const index = this.leaveRequests.findIndex(r => r.id === updatedRequest.id);
        if (index !== -1) {
          this.leaveRequests[index] = updatedRequest;
        }
        
        this.calculateStatistics();
        this.filterRequests();
        this.successMessage = `Leave request ${this.decisionType.toLowerCase()} successfully.`;
        this.selectedRequest = null;
        this.isProcessing = false;
      },
      error: (error) => {
        this.errorMessage = `Failed to ${this.decisionType.toLowerCase()} leave request. Please try again.`;
        this.isProcessing = false;
        console.error('Error making decision:', error);
      }
    });
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

  getStatusColor(status: LeaveStatus): string {
    switch (status) {
      case LeaveStatus.PENDING: return 'warning';
      case LeaveStatus.APPROVED: return 'success';
      case LeaveStatus.REJECTED: return 'danger';
      default: return 'secondary';
    }
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  }

  trackByRequestId(index: number, request: LeaveRequest): string {
    return request.id;
  }
}