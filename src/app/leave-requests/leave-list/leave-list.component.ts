import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { LeaveRequestService } from '../services/leave-request.service';
import { 
  LeaveRequest, 
  LeaveType, 
  LeaveStatus, 
  LEAVE_TYPE_LABELS, 
  LEAVE_STATUS_LABELS,
  LEAVE_STATUS_BADGES 
} from '../../shared/models';

@Component({
  selector: 'app-leave-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './leave-list.component.html',
  styleUrls: ['./leave-list.component.css']
})
export class LeaveListComponent implements OnInit {
  leaveRequests: LeaveRequest[] = [];
  filteredRequests: LeaveRequest[] = [];
  paginatedRequests: LeaveRequest[] = [];
  
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  
  // Filters
  selectedStatus = '';
  selectedType = '';
  searchTerm = '';
  
  // Pagination
  currentPage = 1;
  itemsPerPage = 10;
  totalPages = 0;
  
  // Options for dropdowns
  statusOptions = Object.entries(LEAVE_STATUS_LABELS).map(([value, label]) => ({ value, label }));
  leaveTypes = Object.entries(LEAVE_TYPE_LABELS).map(([value, label]) => ({ value, label }));
  
  // Retraction
  requestToRetract: LeaveRequest | null = null;
  isRetracting = false;

  constructor(
    private leaveService: LeaveRequestService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.loadLeaveRequests();
    this.checkForSuccessMessage();
  }

  private checkForSuccessMessage(): void {
    this.route.queryParams.subscribe(params => {
      if (params['message']) {
        this.successMessage = params['message'];
        // Clear the message from URL
        this.router.navigate([], { 
          relativeTo: this.route,
          queryParams: {},
          replaceUrl: true 
        });
      }
    });
  }

  loadLeaveRequests(): void {
    this.isLoading = true;
    this.errorMessage = '';
    
    this.leaveService.getMyLeaveRequests().subscribe({
      next: (requests) => {
        this.leaveRequests = requests.sort((a, b) => 
          new Date(b.submittedAt || '').getTime() - 
          new Date(a.submittedAt || '').getTime()
        );
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

  filterRequests(): void {
    this.filteredRequests = this.leaveRequests.filter(request => {
      const matchesStatus = !this.selectedStatus || request.status === this.selectedStatus;
      const matchesType = !this.selectedType || request.leaveType === this.selectedType;
      const matchesSearch = !this.searchTerm || 
        request.reason.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      return matchesStatus && matchesType && matchesSearch;
    });
    
    this.currentPage = 1;
    this.updatePagination();
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

  createNewRequest(): void {
    this.router.navigate(['/leave-requests/create']);
  }

  viewDetails(request: LeaveRequest): void {
    this.router.navigate(['/leave-requests/detail', request.id]);
  }

  editRequest(request: LeaveRequest): void {
    this.router.navigate(['/leave-requests/edit', request.id]);
  }

  retractRequest(request: LeaveRequest): void {
    this.requestToRetract = request;
    // In a real app, you'd use a modal service or bootstrap modal
    // For now, we'll call confirmRetract directly
    if (confirm(`Are you sure you want to retract your leave request for ${this.getLeaveTypeLabel(request.leaveType)}?`)) {
      this.confirmRetract();
    }
  }

  confirmRetract(): void {
    if (!this.requestToRetract) return;
    
    this.isRetracting = true;
    
    this.leaveService.retractLeaveRequest(this.requestToRetract.id).subscribe({
      next: (updatedRequest) => {
        // Update the request in our local array
        const index = this.leaveRequests.findIndex(r => r.id === updatedRequest.id);
        if (index !== -1) {
          this.leaveRequests[index] = updatedRequest;
        }
        
        this.filterRequests();
        this.successMessage = 'Leave request retracted successfully.';
        this.requestToRetract = null;
        this.isRetracting = false;
      },
      error: (error) => {
        this.errorMessage = 'Failed to retract leave request. Please try again.';
        this.isRetracting = false;
        console.error('Error retracting leave request:', error);
      }
    });
  }

  // Helper methods
  canEdit(request: LeaveRequest): boolean {
    return request.status === LeaveStatus.PENDING;
  }

  canRetract(request: LeaveRequest): boolean {
    return request.status === LeaveStatus.PENDING;
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