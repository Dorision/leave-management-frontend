import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { Router } from '@angular/router';
import { LeaveRequestService } from '../services/leave-request.service';
import { LeaveType, LEAVE_TYPE_LABELS, CreateLeaveRequest } from '../../shared/models';

@Component({
  selector: 'app-leave-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './leave-create.component.html',
  styleUrls: ['./leave-create.component.css']
})
export class LeaveCreateComponent implements OnInit {
  leaveForm!: FormGroup;
  isSubmitting = false;
  errorMessage = '';
  workdays = 0;
  
  leaveTypes = Object.entries(LEAVE_TYPE_LABELS).map(([value, label]) => ({ value, label }));

  constructor(
    private fb: FormBuilder,
    private leaveService: LeaveRequestService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initializeForm();
  }

  private initializeForm(): void {
    this.leaveForm = this.fb.group({
      leaveType: ['', Validators.required],
      startDate: ['', [Validators.required, this.futureDateValidator]],
      endDate: ['', Validators.required],
      reason: ['', [Validators.required, Validators.minLength(10)]]
    }, {
      validators: this.dateRangeValidator
    });

    // Calculate workdays when dates change
    this.leaveForm.get('startDate')?.valueChanges.subscribe(() => this.calculateWorkdays());
    this.leaveForm.get('endDate')?.valueChanges.subscribe(() => this.calculateWorkdays());
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
    const startDate = this.leaveForm.get('startDate')?.value;
    const endDate = this.leaveForm.get('endDate')?.value;
    
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

  onSubmit(): void {
    if (this.leaveForm.valid) {
      this.isSubmitting = true;
      this.errorMessage = '';

      const formValue = this.leaveForm.value;
      const leaveRequest: CreateLeaveRequest = {
        leaveType: formValue.leaveType,
        startDate: formValue.startDate,
        endDate: formValue.endDate,
        reason: formValue.reason
      };

      this.leaveService.createLeaveRequest(leaveRequest).subscribe({
        next: (response) => {
          // Show success message and navigate to leave list
          this.router.navigate(['/leave-requests/list'], { 
            queryParams: { message: 'Leave request submitted successfully!' }
          });
        },
        error: (error) => {
          this.isSubmitting = false;
          this.errorMessage = error.error?.message || 'An error occurred while submitting your request. Please try again.';
        }
      });
    } else {
      // Mark all fields as touched to show validation errors
      Object.keys(this.leaveForm.controls).forEach(key => {
        this.leaveForm.get(key)?.markAsTouched();
      });
    }
  }

  onCancel(): void {
    this.router.navigate(['/leave-requests/list']);
  }
}