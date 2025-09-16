import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-unauthorized',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="container-fluid vh-100 d-flex align-items-center justify-content-center">
      <div class="text-center">
        <div class="error-code mb-4">
          <h1 class="display-1 fw-bold text-warning">403</h1>
        </div>
        <div class="error-message mb-4">
          <h2 class="h4 mb-3">Access Denied</h2>
          <p class="text-muted">
            You don't have permission to access this resource.
          </p>
        </div>
        <div class="error-actions">
          <button 
            type="button" 
            class="btn btn-primary me-3"
            routerLink="/"
          >
            <i class="fas fa-home me-2"></i>
            Go Home
          </button>
          <button 
            type="button" 
            class="btn btn-outline-secondary"
            onclick="history.back()"
          >
            <i class="fas fa-arrow-left me-2"></i>
            Go Back
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .error-code h1 {
      color: #ffc107;
      text-shadow: 2px 2px 4px rgba(0,0,0,0.1);
    }
    
    .container-fluid {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }
    
    .error-message h2 {
      color: white;
    }
    
    .text-muted {
      color: rgba(255, 255, 255, 0.7) !important;
    }
  `]
})
export class UnauthorizedComponent { }