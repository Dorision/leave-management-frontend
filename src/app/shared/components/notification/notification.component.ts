import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { NotificationService } from '../../services/notification.service';
import { NotificationData } from '../../models';

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="position-fixed top-0 end-0 p-3" style="z-index: 1055;">
      <div *ngFor="let notification of notifications" 
           class="toast show mb-2" 
           role="alert" 
           aria-live="assertive" 
           aria-atomic="true">
        <div class="toast-header" [ngClass]="getToastHeaderClass(notification.type)">
          <span class="me-2">{{ getIcon(notification.type) }}</span>
          <strong class="me-auto">{{ notification.title }}</strong>
          <button type="button" 
                  class="btn-close" 
                  aria-label="Close"
                  (click)="remove(notification)">
          </button>
        </div>
        <div class="toast-body" [ngClass]="getToastBodyClass(notification.type)">
          {{ notification.message }}
        </div>
      </div>
    </div>
  `,
  styles: [`
    .toast {
      min-width: 300px;
      max-width: 400px;
    }
    
    .toast-header {
      font-weight: 500;
    }
    
    .toast-header.bg-success {
      color: white;
    }
    
    .toast-header.bg-danger {
      color: white;
    }
    
    .toast-header.bg-warning {
      color: black;
    }
    
    .toast-header.bg-info {
      color: white;
    }
    
    .btn-close {
      filter: invert(1);
    }
    
    .toast-header.bg-warning .btn-close {
      filter: none;
    }
  `]
})
export class NotificationComponent implements OnInit, OnDestroy {
  notifications: NotificationData[] = [];
  private subscription: Subscription = new Subscription();

  constructor(private notificationService: NotificationService) {}

  ngOnInit(): void {
    this.subscription = this.notificationService.notifications$.subscribe(
      notifications => this.notifications = notifications
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  remove(notification: NotificationData): void {
    this.notificationService.remove(notification);
  }

  getToastHeaderClass(type: NotificationData['type']): string {
    switch (type) {
      case 'success':
        return 'bg-success text-white';
      case 'error':
        return 'bg-danger text-white';
      case 'warning':
        return 'bg-warning text-dark';
      case 'info':
        return 'bg-info text-white';
      default:
        return 'bg-primary text-white';
    }
  }

  getToastBodyClass(type: NotificationData['type']): string {
    switch (type) {
      case 'success':
        return 'border-success';
      case 'error':
        return 'border-danger';
      case 'warning':
        return 'border-warning';
      case 'info':
        return 'border-info';
      default:
        return 'border-primary';
    }
  }

  getIcon(type: NotificationData['type']): string {
    switch (type) {
      case 'success':
        return '✓';
      case 'error':
        return '✗';
      case 'warning':
        return '⚠';
      case 'info':
        return 'ℹ';
      default:
        return '•';
    }
  }
}