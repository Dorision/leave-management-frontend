import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { LeaveRequestService } from '../services/leave-request.service';
import { AuthService } from '../../auth/services/auth.service';
import { 
  LeaveRequest, 
  UpdateLeaveRequest,
  LeaveType, 
  LeaveStatus,
  LEAVE_TYPE_LABELS, 
  LEAVE_STATUS_LABELS,
  LEAVE_STATUS_BADGES,
  UserRole
} from '../../shared/models';

@Component({
  selector: 'app-leave-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './leave-edit.component.html',
  styleUrls: ['./leave-edit.component.css']
})
export class LeaveEditComponent implements OnInit {
  leaveForm!: FormGroup;
  originalRequest: LeaveRequest | null = null;
  isLoading = false;
  isSubmitting = false;
  errorMessage = '';
  updateErrorMessage = '';
  workdays = 0;
  
  leaveTypes = Object.entries(LEAVE_TYPE_LABELS).map(([value, label]) => ({ value, label }));

  constructor(
    private fb: FormBuilder,
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

    // Try to find in user's requests first
    this.leaveService.getMyLeaveRequests().subscribe({
      next: (requests) => {
        const found = requests.find(r => r.id === id);
        if (found && this.canEditRequest(found)) {
          this.originalRequest = found;
          this.initializeForm();
          this.isLoading = false;
        } else if (found) {
          this.errorMessage = 'This leave request cannot be edited (status: ' + found.status + ')';
          this.isLoading = false;
        } else {
          this.errorMessage = 'Leave request not found';
          this.isLoading = false;
        }
      },
      error: (error) => {
        this.errorMessage = 'Failed to load leave request';
        this.isLoading = false;
        console.error('Error loading leave request:', error);
      }
    });
  }

  private canEditRequest(request: LeaveRequest): boolean {
    const currentUser = this.authService.getCurrentUser();
    
    // Only the request owner can edit
    if (currentUser?.id !== request.userId) {
      return false;
    }
    
    // Only pending requests can be edited
    return request.status === LeaveStatus.PENDING;
  }

  private initializeForm(): void {
    if (!this.originalRequest) return;

    this.leaveForm = this.fb.group({
      leaveType: [this.originalRequest.leaveType, Validators.required],
      startDate: [this.formatDateForInput(this.originalRequest.startDate), [Validators.required, this.futureDateValidator]],
      endDate: [this.formatDateForInput(this.originalRequest.endDate), Validators.required],
      reason: [this.originalRequest.reason, [Validators.required, Validators.minLength(10)]]
    }, {
      validators: this.dateRangeValidator
    });

    // Calculate workdays when dates change
    this.leaveForm.get('startDate')?.valueChanges.subscribe(() => this.calculateWorkdays());
    this.leaveForm.get('endDate')?.valueChanges.subscribe(() => this.calculateWorkdays());

    // Initial workdays calculation
    this.calculateWorkdays();
  }

  private formatDateForInput(dateString: string): string {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toISOString().split('T')[0];
    } catch {
      return '';
    }
  }

  private futureDateValidator(control: AbstractControl): { [key: string]: any } | null {
    if (!control.value) return null;
    
    const selectedDate = new Date(control.value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return selectedDate < today ? { pastDate: true } : null;
  }

  private dateRangeValidator(form: AbstractControl): { [key: string]: any } | null {
    const startDate = form.get('startDate')?.value;
    const endDate = form.get('endDate')?.value;
    
    if (!startDate || !endDate) return null;
    
    return new Date(endDate) < new Date(startDate) ? { beforeStart: true } : null;
  }

  private calculateWorkdays(): void {
    const startDate = this.leaveForm?.get('startDate')?.value;
    const endDate = this.leaveForm?.get('endDate')?.value;
    
    if (startDate && endDate && new Date(endDate) >= new Date(startDate)) {
      this.leaveService.calculateWorkdays(startDate, endDate).subscribe({
        next: (response) => {
          this.workdays = response.workdays;
        },
        error: (error) => {
          console.error('Error calculating workdays:', error);
          this.workdays = 0;
        }
      });
    } else {
      this.workdays = 0;
    }
  }

  hasChanges(): boolean {
    if (!this.leaveForm || !this.originalRequest) return false;

    const formValue = this.leaveForm.value;
    return (
      formValue.leaveType !== this.originalRequest.leaveType ||
      formValue.startDate !== this.formatDateForInput(this.originalRequest.startDate) ||
      formValue.endDate !== this.formatDateForInput(this.originalRequest.endDate) ||
      formValue.reason !== this.originalRequest.reason
    );
  }

  hasFieldChanged(fieldName: string): boolean {
    if (!this.leaveForm || !this.originalRequest) return false;

    const formValue = this.leaveForm.value;
    switch (fieldName) {
      case 'leaveType':
        return formValue.leaveType !== this.originalRequest.leaveType;
      case 'startDate':
        return formValue.startDate !== this.formatDateForInput(this.originalRequest.startDate);
      case 'endDate':
        return formValue.endDate !== this.formatDateForInput(this.originalRequest.endDate);
      case 'reason':
        return formValue.reason !== this.originalRequest.reason;
      default:
        return false;
    }
  }

  resetForm(): void {
    if (this.originalRequest) {
      this.initializeForm();
      this.updateErrorMessage = '';
    }
  }

  onSubmit(): void {
    if (this.leaveForm.valid && this.hasChanges() && this.originalRequest) {
      this.isSubmitting = true;
      this.updateErrorMessage = '';

      const formValue = this.leaveForm.value;
      const updateRequest: UpdateLeaveRequest = {
        leaveType: formValue.leaveType,
        startDate: formValue.startDate,
        endDate: formValue.endDate,
        reason: formValue.reason
      };

      this.leaveService.updateLeaveRequest(this.originalRequest.id, updateRequest).subscribe({
        next: (response) => {
          // Show success message and navigate back
          this.router.navigate(['/leave-requests/list'], { 
            queryParams: { message: 'Leave request updated successfully!' }
          });
        },
        error: (error) => {
          this.isSubmitting = false;
          this.updateErrorMessage = error.error?.message || 'An error occurred while updating your request. Please try again.';
        }
      });
    } else if (!this.hasChanges()) {
      this.updateErrorMessage = 'No changes detected. Please make changes before updating.';
    } else {
      // Mark all fields as touched to show validation errors
      Object.keys(this.leaveForm.controls).forEach(key => {
        this.leaveForm.get(key)?.markAsTouched();
      });
    }
  }

  goBack(): void {
    this.location.back();
  }

  // Helper methods
  getLeaveTypeLabel(type: LeaveType | string): string {
    return LEAVE_TYPE_LABELS[type as LeaveType] || type;
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
}