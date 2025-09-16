import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container-fluid py-4">
      <div class="row">
        <div class="col-lg-8 mx-auto">
          <div class="card border-0 shadow-sm">
            <div class="card-header bg-transparent border-0">
              <h5 class="card-title mb-0">User Profile</h5>
            </div>
            <div class="card-body">
              <div class="text-center py-5 text-muted">
                <i class="fas fa-user fa-3x mb-3 opacity-50"></i>
                <h6>User Profile Management</h6>
                <p>This component will allow users to view and edit their profile information.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ProfileComponent { }