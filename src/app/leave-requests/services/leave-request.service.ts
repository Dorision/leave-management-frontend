import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { 
  LeaveRequest, 
  CreateLeaveRequest, 
  UpdateLeaveRequest, 
  LeaveDecision,
  ApiResponse 
} from '../../shared/models';
import { AuthService } from '../../auth/services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class LeaveRequestService {
  private readonly API_URL = 'http://localhost:5000/api/leaves';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }

  private getHttpOptions(): { headers: HttpHeaders } {
    const token = this.authService.getToken();
    return {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
      })
    };
  }

  // Create a new leave request
  createLeaveRequest(request: CreateLeaveRequest): Observable<LeaveRequest> {
    return this.http.post<LeaveRequest>(`${this.API_URL}`, request, this.getHttpOptions())
      .pipe(
        catchError(error => {
          console.error('Error creating leave request:', error);
          return throwError(() => error);
        })
      );
  }

  // Update an existing leave request
  updateLeaveRequest(id: string, request: UpdateLeaveRequest): Observable<LeaveRequest> {
    return this.http.put<LeaveRequest>(`${this.API_URL}/${id}`, request, this.getHttpOptions())
      .pipe(
        catchError(error => {
          console.error('Error updating leave request:', error);
          return throwError(() => error);
        })
      );
  }

  // Retract a leave request
  retractLeaveRequest(id: string): Observable<LeaveRequest> {
    return this.http.post<LeaveRequest>(`${this.API_URL}/${id}/retract`, {}, this.getHttpOptions())
      .pipe(
        catchError(error => {
          console.error('Error retracting leave request:', error);
          return throwError(() => error);
        })
      );
  }

  // Get current user's leave requests
  getMyLeaveRequests(): Observable<LeaveRequest[]> {
    return this.http.get<LeaveRequest[]>(`${this.API_URL}/mine`, this.getHttpOptions())
      .pipe(
        catchError(error => {
          console.error('Error fetching my leave requests:', error);
          return throwError(() => error);
        })
      );
  }

  // Get subordinate leave requests (for managers)
  getSubordinateLeaveRequests(): Observable<LeaveRequest[]> {
    return this.http.get<LeaveRequest[]>(`${this.API_URL}/subordinates`, this.getHttpOptions())
      .pipe(
        catchError(error => {
          console.error('Error fetching subordinate leave requests:', error);
          return throwError(() => error);
        })
      );
  }

  // Make decision on leave request (for managers)
  makeDecision(id: string, decision: LeaveDecision): Observable<LeaveRequest> {
    return this.http.put<LeaveRequest>(`${this.API_URL}/${id}/decision`, decision, this.getHttpOptions())
      .pipe(
        catchError(error => {
          console.error('Error making leave decision:', error);
          return throwError(() => error);
        })
      );
  }

  // Calculate workdays between dates
  calculateWorkdays(startDate: string, endDate: string): Observable<{ workdays: number }> {
    const params = `startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}`;
    return this.http.get<{ workdays: number }>(`${this.API_URL}/workdays?${params}`, this.getHttpOptions())
      .pipe(
        catchError(error => {
          console.error('Error calculating workdays:', error);
          return throwError(() => error);
        })
      );
  }
}
