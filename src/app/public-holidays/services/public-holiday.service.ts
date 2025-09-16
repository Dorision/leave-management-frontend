import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { PublicHoliday } from '../../shared/models';
import { AuthService } from '../../auth/services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class PublicHolidayService {
  private readonly API_URL = 'http://localhost:5254/api/publicholidays'; // Direct backend URL

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

  // Get all public holidays
  getPublicHolidays(): Observable<PublicHoliday[]> {
    return this.http.get<PublicHoliday[]>(`${this.API_URL}`, this.getHttpOptions())
      .pipe(
        catchError(error => {
          console.error('Error fetching public holidays:', error);
          return throwError(() => error);
        })
      );
  }

  // Create a new public holiday (Admin only)
  createPublicHoliday(holiday: Omit<PublicHoliday, 'id'>): Observable<PublicHoliday> {
    return this.http.post<PublicHoliday>(`${this.API_URL}`, holiday, this.getHttpOptions())
      .pipe(
        catchError(error => {
          console.error('Error creating public holiday:', error);
          return throwError(() => error);
        })
      );
  }

  // Update a public holiday (Admin only)
  updatePublicHoliday(id: string, holiday: PublicHoliday): Observable<PublicHoliday> {
    return this.http.put<PublicHoliday>(`${this.API_URL}/${id}`, holiday, this.getHttpOptions())
      .pipe(
        catchError(error => {
          console.error('Error updating public holiday:', error);
          return throwError(() => error);
        })
      );
  }

  // Delete a public holiday (Admin only)
  deletePublicHoliday(id: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`, this.getHttpOptions())
      .pipe(
        catchError(error => {
          console.error('Error deleting public holiday:', error);
          return throwError(() => error);
        })
      );
  }
}
