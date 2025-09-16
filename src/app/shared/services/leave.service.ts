import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { 
  LeaveRequest, 
  ApiResponse, 
  PaginatedResponse, 
  LeaveStatus, 
  LeaveType,
  LeaveBalance 
} from '../../shared/models';

export interface LeaveRequestFilters {
  status?: LeaveStatus;
  leaveType?: LeaveType;
  startDate?: string;
  endDate?: string;
  employeeId?: number;
  page?: number;
  limit?: number;
}

export interface CreateLeaveRequest {
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  reason: string;
  attachments?: File[];
}

export interface UpdateLeaveRequest {
  leaveType?: LeaveType;
  startDate?: string;
  endDate?: string;
  reason?: string;
  attachments?: File[];
}

export interface ApproveRejectRequest {
  status: LeaveStatus.APPROVED | LeaveStatus.REJECTED;
  rejectionReason?: string;
}

@Injectable({
  providedIn: 'root'
})
export class LeaveService {
  private readonly API_URL = 'http://localhost:3000/api'; // This should be from environment

  constructor(private http: HttpClient) { }

  // Employee Methods
  getMyLeaveRequests(filters?: LeaveRequestFilters): Observable<PaginatedResponse<LeaveRequest>> {
    let params = new HttpParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          params = params.append(key, value.toString());
        }
      });
    }

    return this.http.get<PaginatedResponse<LeaveRequest>>(`${this.API_URL}/leave-requests/my`, { params })
      .pipe(
        catchError(this.handleError)
      );
  }

  getMyLeaveBalance(): Observable<LeaveBalance[]> {
    return this.http.get<ApiResponse<LeaveBalance[]>>(`${this.API_URL}/leave-requests/my-balance`)
      .pipe(
        map(response => {
          if (!response.success || !response.data) {
            throw new Error(response.message || 'Failed to fetch leave balance');
          }
          return response.data;
        }),
        catchError(this.handleError)
      );
  }

  createLeaveRequest(request: CreateLeaveRequest): Observable<LeaveRequest> {
    const formData = new FormData();
    formData.append('leaveType', request.leaveType);
    formData.append('startDate', request.startDate);
    formData.append('endDate', request.endDate);
    formData.append('reason', request.reason);

    if (request.attachments && request.attachments.length > 0) {
      request.attachments.forEach((file, index) => {
        formData.append(`attachments`, file);
      });
    }

    return this.http.post<ApiResponse<LeaveRequest>>(`${this.API_URL}/leave-requests`, formData)
      .pipe(
        map(response => {
          if (!response.success || !response.data) {
            throw new Error(response.message || 'Failed to create leave request');
          }
          return response.data;
        }),
        catchError(this.handleError)
      );
  }

  updateLeaveRequest(id: number, request: UpdateLeaveRequest): Observable<LeaveRequest> {
    const formData = new FormData();
    
    Object.entries(request).forEach(([key, value]) => {
      if (value !== undefined && key !== 'attachments') {
        formData.append(key, value.toString());
      }
    });

    if (request.attachments && request.attachments.length > 0) {
      request.attachments.forEach((file) => {
        formData.append(`attachments`, file);
      });
    }

    return this.http.put<ApiResponse<LeaveRequest>>(`${this.API_URL}/leave-requests/${id}`, formData)
      .pipe(
        map(response => {
          if (!response.success || !response.data) {
            throw new Error(response.message || 'Failed to update leave request');
          }
          return response.data;
        }),
        catchError(this.handleError)
      );
  }

  cancelLeaveRequest(id: number): Observable<LeaveRequest> {
    return this.http.patch<ApiResponse<LeaveRequest>>(`${this.API_URL}/leave-requests/${id}/cancel`, {})
      .pipe(
        map(response => {
          if (!response.success || !response.data) {
            throw new Error(response.message || 'Failed to cancel leave request');
          }
          return response.data;
        }),
        catchError(this.handleError)
      );
  }

  getLeaveRequestById(id: number): Observable<LeaveRequest> {
    return this.http.get<ApiResponse<LeaveRequest>>(`${this.API_URL}/leave-requests/${id}`)
      .pipe(
        map(response => {
          if (!response.success || !response.data) {
            throw new Error(response.message || 'Failed to fetch leave request');
          }
          return response.data;
        }),
        catchError(this.handleError)
      );
  }

  // Manager/HR Methods
  getAllLeaveRequests(filters?: LeaveRequestFilters): Observable<PaginatedResponse<LeaveRequest>> {
    let params = new HttpParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          params = params.append(key, value.toString());
        }
      });
    }

    return this.http.get<PaginatedResponse<LeaveRequest>>(`${this.API_URL}/leave-requests`, { params })
      .pipe(
        catchError(this.handleError)
      );
  }

  getPendingLeaveRequests(filters?: LeaveRequestFilters): Observable<PaginatedResponse<LeaveRequest>> {
    const pendingFilters = { ...filters, status: LeaveStatus.PENDING };
    return this.getAllLeaveRequests(pendingFilters);
  }

  approveLeaveRequest(id: number, rejectionReason?: string): Observable<LeaveRequest> {
    const request: ApproveRejectRequest = {
      status: LeaveStatus.APPROVED,
      ...(rejectionReason && { rejectionReason })
    };

    return this.http.patch<ApiResponse<LeaveRequest>>(`${this.API_URL}/leave-requests/${id}/approve`, request)
      .pipe(
        map(response => {
          if (!response.success || !response.data) {
            throw new Error(response.message || 'Failed to approve leave request');
          }
          return response.data;
        }),
        catchError(this.handleError)
      );
  }

  rejectLeaveRequest(id: number, rejectionReason: string): Observable<LeaveRequest> {
    const request: ApproveRejectRequest = {
      status: LeaveStatus.REJECTED,
      rejectionReason
    };

    return this.http.patch<ApiResponse<LeaveRequest>>(`${this.API_URL}/leave-requests/${id}/reject`, request)
      .pipe(
        map(response => {
          if (!response.success || !response.data) {
            throw new Error(response.message || 'Failed to reject leave request');
          }
          return response.data;
        }),
        catchError(this.handleError)
      );
  }

  // Statistical Methods for Dashboards
  getLeaveStatistics(): Observable<any> {
    return this.http.get<ApiResponse<any>>(`${this.API_URL}/leave-requests/statistics`)
      .pipe(
        map(response => {
          if (!response.success || !response.data) {
            throw new Error(response.message || 'Failed to fetch leave statistics');
          }
          return response.data;
        }),
        catchError(this.handleError)
      );
  }

  getTeamLeaveCalendar(startDate: string, endDate: string): Observable<LeaveRequest[]> {
    const params = new HttpParams()
      .set('startDate', startDate)
      .set('endDate', endDate);

    return this.http.get<ApiResponse<LeaveRequest[]>>(`${this.API_URL}/leave-requests/team-calendar`, { params })
      .pipe(
        map(response => {
          if (!response.success || !response.data) {
            throw new Error(response.message || 'Failed to fetch team calendar');
          }
          return response.data;
        }),
        catchError(this.handleError)
      );
  }

  // Utility Methods
  calculateLeaveDays(startDate: string, endDate: string): number {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const timeDiff = end.getTime() - start.getTime();
    const dayDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
    return dayDiff + 1; // Include both start and end dates
  }

  isValidDateRange(startDate: string, endDate: string): boolean {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const today = new Date();
    
    // Start date should be today or in the future
    if (start < today) return false;
    
    // End date should be after start date
    if (end <= start) return false;
    
    return true;
  }

  getLeaveTypeOptions(): { value: LeaveType; label: string; }[] {
    return [
      { value: LeaveType.ANNUAL, label: 'Annual Leave' },
      { value: LeaveType.SICK, label: 'Sick Leave' },
      { value: LeaveType.MATERNITY, label: 'Maternity Leave' },
      { value: LeaveType.PATERNITY, label: 'Paternity Leave' },
      { value: LeaveType.FAMILY_RESPONSIBILITY, label: 'Family Responsibility Leave' },
      { value: LeaveType.STUDY, label: 'Study Leave' },
      { value: LeaveType.UNPAID, label: 'Unpaid Leave' }
    ];
  }

  getStatusOptions(): { value: LeaveStatus; label: string; color: string; }[] {
    return [
      { value: LeaveStatus.PENDING, label: 'Pending', color: 'warning' },
      { value: LeaveStatus.APPROVED, label: 'Approved', color: 'success' },
      { value: LeaveStatus.REJECTED, label: 'Rejected', color: 'danger' },
      { value: LeaveStatus.CANCELLED, label: 'Cancelled', color: 'secondary' }
    ];
  }

  downloadAttachment(leaveRequestId: number, filename: string): Observable<Blob> {
    return this.http.get(`${this.API_URL}/leave-requests/${leaveRequestId}/attachments/${filename}`, {
      responseType: 'blob'
    }).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: any): Observable<never> {
    console.error('LeaveService error:', error);
    
    let errorMessage = 'An unexpected error occurred';
    
    if (error.error?.message) {
      errorMessage = error.error.message;
    } else if (error.message) {
      errorMessage = error.message;
    } else if (error.status === 0) {
      errorMessage = 'Unable to connect to the server';
    } else if (error.status === 401) {
      errorMessage = 'You are not authorized to perform this action';
    } else if (error.status === 403) {
      errorMessage = 'You do not have permission to perform this action';
    } else if (error.status === 404) {
      errorMessage = 'The requested resource was not found';
    } else if (error.status >= 500) {
      errorMessage = 'Server error. Please try again later';
    }

    return throwError(() => new Error(errorMessage));
  }
}