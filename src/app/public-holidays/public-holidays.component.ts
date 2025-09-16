import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PublicHolidayService } from './services/public-holiday.service';
import { AuthService } from '../auth/services/auth.service';
import { PublicHoliday } from '../shared/models/public-holiday.model';

@Component({
  selector: 'app-public-holidays',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './public-holidays.component.html',
  styleUrl: './public-holidays.component.css'
})
export class PublicHolidaysComponent implements OnInit {
  holidays: PublicHoliday[] = [];
  filteredHolidays: PublicHoliday[] = [];
  holidayForm: FormGroup;
  editingHoliday: PublicHoliday | null = null;
  loading = false;
  error = '';
  searchTerm = '';
  selectedYear = new Date().getFullYear();
  years = [2023, 2024, 2025, 2026, 2027, 2028, 2029, 2030];
  showForm = false;
  isAdmin = false;

  // Pagination
  currentPage = 1;
  itemsPerPage = 10;
  totalItems = 0;

  constructor(
    private holidayService: PublicHolidayService,
    private authService: AuthService,
    private fb: FormBuilder,
    private router: Router
  ) {
    this.holidayForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(100)]],
      date: ['', Validators.required],
      description: ['', Validators.maxLength(500)]
    });
  }

  ngOnInit(): void {
    this.checkAdminAccess();
    this.loadHolidays();
  }

  checkAdminAccess(): void {
    this.isAdmin = this.authService.isAdmin();
    
    if (!this.isAdmin) {
      // Regular users can only view holidays
      this.loadHolidays();
    }
  }

  loadHolidays(): void {
    this.loading = true;
    this.error = '';

    this.holidayService.getPublicHolidays().subscribe({
      next: (holidays) => {
        this.holidays = holidays;
        this.applyFilters();
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Failed to load public holidays. Please try again.';
        this.loading = false;
        console.error('Error loading holidays:', error);
      }
    });
  }

  applyFilters(): void {
    let filtered = [...this.holidays];

    // Apply search filter
    if (this.searchTerm) {
      const searchLower = this.searchTerm.toLowerCase();
      filtered = filtered.filter(holiday =>
        holiday.name.toLowerCase().includes(searchLower) ||
        (holiday.description && holiday.description.toLowerCase().includes(searchLower))
      );
    }

    this.filteredHolidays = filtered;
    this.totalItems = filtered.length;
    this.currentPage = 1; // Reset to first page when filtering
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  onYearChange(): void {
    this.loadHolidays();
  }

  getPaginatedHolidays(): PublicHoliday[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.filteredHolidays.slice(startIndex, endIndex);
  }

  getTotalPages(): number {
    return Math.ceil(this.totalItems / this.itemsPerPage);
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.getTotalPages()) {
      this.currentPage = page;
    }
  }

  showAddForm(): void {
    this.editingHoliday = null;
    this.holidayForm.reset();
    this.showForm = true;
  }

  showEditForm(holiday: PublicHoliday): void {
    this.editingHoliday = holiday;
    this.holidayForm.patchValue({
      name: holiday.name,
      date: this.formatDateForInput(holiday.date),
      description: holiday.description
    });
    this.showForm = true;
  }

  hideForm(): void {
    this.showForm = false;
    this.editingHoliday = null;
    this.holidayForm.reset();
  }

  onSubmit(): void {
    if (this.holidayForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    const formData = this.holidayForm.value;

    this.loading = true;

    if (this.editingHoliday) {
      // Update existing holiday
      const updatedHoliday: PublicHoliday = {
        id: this.editingHoliday.id,
        name: formData.name,
        date: new Date(formData.date),
        description: formData.description || '',
        isRecurring: false,
        createdAt: this.editingHoliday.createdAt,
        updatedAt: new Date()
      };

      this.holidayService.updatePublicHoliday(this.editingHoliday.id, updatedHoliday).subscribe({
        next: () => {
          this.loadHolidays();
          this.hideForm();
          this.loading = false;
        },
        error: (error) => {
          this.error = 'Failed to update holiday. Please try again.';
          this.loading = false;
          console.error('Error updating holiday:', error);
        }
      });
    } else {
      // Create new holiday
      const newHoliday: Omit<PublicHoliday, 'id'> = {
        name: formData.name,
        date: new Date(formData.date),
        description: formData.description || '',
        isRecurring: false,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      this.holidayService.createPublicHoliday(newHoliday).subscribe({
        next: () => {
          this.loadHolidays();
          this.hideForm();
          this.loading = false;
        },
        error: (error) => {
          this.error = 'Failed to create holiday. Please try again.';
          this.loading = false;
          console.error('Error creating holiday:', error);
        }
      });
    }
  }

  deleteHoliday(holiday: PublicHoliday): void {
    if (confirm(`Are you sure you want to delete "${holiday.name}"?`)) {
      this.loading = true;
      
      this.holidayService.deletePublicHoliday(holiday.id).subscribe({
        next: () => {
          this.loadHolidays();
          this.loading = false;
        },
        error: (error) => {
          this.error = 'Failed to delete holiday. Please try again.';
          this.loading = false;
          console.error('Error deleting holiday:', error);
        }
      });
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.holidayForm.controls).forEach(key => {
      this.holidayForm.get(key)?.markAsTouched();
    });
  }

  private formatDateForInput(date: Date): string {
    const d = new Date(date);
    return d.toISOString().split('T')[0];
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.holidayForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.holidayForm.get(fieldName);
    if (field && field.errors) {
      if (field.errors['required']) {
        return `${fieldName} is required`;
      }
      if (field.errors['maxlength']) {
        return `${fieldName} is too long`;
      }
    }
    return '';
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  getDayOfWeek(date: Date): string {
    return new Date(date).toLocaleDateString('en-US', { weekday: 'long' });
  }

  sortHolidaysByDate(): void {
    this.filteredHolidays.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }

  exportHolidays(): void {
    // Simple CSV export
    const headers = ['Name', 'Date', 'Day of Week', 'Description'];
    const csvContent = [
      headers.join(','),
      ...this.filteredHolidays.map(holiday => [
        `"${holiday.name}"`,
        this.formatDateForInput(holiday.date),
        `"${this.getDayOfWeek(holiday.date)}"`,
        `"${holiday.description || ''}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `public-holidays-${this.selectedYear}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  }
}
