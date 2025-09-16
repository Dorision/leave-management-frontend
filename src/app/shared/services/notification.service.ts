import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { NotificationData } from '../models';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notifications: NotificationData[] = [];
  private notificationsSubject = new BehaviorSubject<NotificationData[]>([]);
  public notifications$ = this.notificationsSubject.asObservable();

  constructor() { }

  show(notification: Omit<NotificationData, 'duration'> & { duration?: number }): void {
    const fullNotification: NotificationData = {
      ...notification,
      duration: notification.duration || 5000
    };

    this.notifications.push(fullNotification);
    this.notificationsSubject.next([...this.notifications]);

    // Auto-remove after duration
    setTimeout(() => {
      this.remove(fullNotification);
    }, fullNotification.duration);
  }

  success(title: string, message: string, duration?: number): void {
    this.show({
      type: 'success',
      title,
      message,
      duration
    });
  }

  error(title: string, message: string, duration?: number): void {
    this.show({
      type: 'error',
      title,
      message,
      duration: duration || 8000 // Errors stay longer
    });
  }

  warning(title: string, message: string, duration?: number): void {
    this.show({
      type: 'warning',
      title,
      message,
      duration
    });
  }

  info(title: string, message: string, duration?: number): void {
    this.show({
      type: 'info',
      title,
      message,
      duration
    });
  }

  remove(notification: NotificationData): void {
    const index = this.notifications.indexOf(notification);
    if (index > -1) {
      this.notifications.splice(index, 1);
      this.notificationsSubject.next([...this.notifications]);
    }
  }

  clear(): void {
    this.notifications = [];
    this.notificationsSubject.next([]);
  }

  getBootstrapClass(type: NotificationData['type']): string {
    switch (type) {
      case 'success':
        return 'text-bg-success';
      case 'error':
        return 'text-bg-danger';
      case 'warning':
        return 'text-bg-warning';
      case 'info':
        return 'text-bg-info';
      default:
        return 'text-bg-primary';
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
