import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService } from './auth/services/auth.service';
import { NavbarComponent } from './shared/components/navbar/navbar.component';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, NavbarComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'leave-management-frontend';
  showNavbar = false;

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Listen to route changes to show/hide navbar
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event) => {
        if (event instanceof NavigationEnd) {
          this.updateNavbarVisibility(event.url);
        }
      });

    // Listen to authentication state changes
    this.authService.isAuthenticated$.subscribe(isAuthenticated => {
      this.updateNavbarVisibility(this.router.url);
    });

    // Initial check
    this.updateNavbarVisibility(this.router.url);
  }

  private updateNavbarVisibility(url: string): void {
    const hideNavbarRoutes = ['/login', '/unauthorized'];
    const isAuthenticated = this.authService.isAuthenticated();
    
    // Hide navbar on login page or if not authenticated
    this.showNavbar = isAuthenticated && !hideNavbarRoutes.some(route => url.startsWith(route));
  }
}
