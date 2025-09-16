# Leave Management System - Frontend

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 17.2.2.

## 📋 Overview

A comprehensive leave management system built with Angular 17.3.12 that enables employees to request leave and managers to approve/reject leave requests. The system features role-based authentication, real-time status updates, and an intuitive dashboard interface.

## 🏗️ Application Flow Diagram

### 🔐 Authentication Flow
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Login Page    │───▶│  JWT Token      │───▶│  Role Detection │
│ (email/password)│    │  Validation     │    │ (Employee/Mgr)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                        │
                              ┌─────────────────────────┼─────────────────────────┐
                              ▼                         ▼                         ▼
                    ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
                    │ Employee Route  │    │  Manager Route  │    │   Shared Route  │
                    │   Protection    │    │   Protection    │    │   (Holidays)    │
                    └─────────────────┘    └─────────────────┘    └─────────────────┘
```

### 👨‍💼 Employee Workflow
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│ Employee Login  │───▶│ Employee        │───▶│ Leave Request   │───▶│ Submit Request  │
│                 │    │ Dashboard       │    │ Creation        │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘    └─────────────────┘
                              │                                              │
                              ▼                                              ▼
                    ┌─────────────────┐                           ┌─────────────────┐
                    │ View Leave      │◀──────────────────────────│ Request Status  │
                    │ History/Status  │                           │ (Pending/       │
                    └─────────────────┘                           │ Approved/       │
                              │                                   │ Rejected)       │
                              ▼                                   └─────────────────┘
                    ┌─────────────────┐
                    │ Edit/Cancel     │
                    │ Pending Requests│
                    └─────────────────┘
```

### 👩‍💼 Manager Workflow
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│ Manager Login   │───▶│ Manager         │───▶│ View Pending    │
│                 │    │ Dashboard       │    │ Requests        │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │                         │
                              ▼                         ▼
                    ┌─────────────────┐    ┌─────────────────┐
                    │ Quick Actions   │    │ Detailed        │
                    │ (✅ Approve     │    │ Approval Page   │
                    │  ❌ Reject)     │    │                 │
                    └─────────────────┘    └─────────────────┘
                              │                         │
                              └─────────┬─────────────────┘
                                        ▼
                              ┌─────────────────┐
                              │ Update Request  │
                              │ Status & Notify │
                              │ Employee        │
                              └─────────────────┘
```

### 🔄 Complete System Flow
```
                                 ┌─────────────────┐
                                 │   Application   │
                                 │     Start       │
                                 └─────────────────┘
                                          │
                                          ▼
                                 ┌─────────────────┐
                                 │  Login Screen   │
                                 │ (Authentication)│
                                 └─────────────────┘
                                          │
                              ┌───────────┼───────────┐
                              ▼           ▼           ▼
                    ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
                    │  Employee   │ │   Manager   │ │   Admin     │
                    │  Dashboard  │ │  Dashboard  │ │  (Future)   │
                    └─────────────┘ └─────────────┘ └─────────────┘
                            │               │
              ┌─────────────┼─────────────┐ │
              ▼             ▼             ▼ ▼
    ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
    │ Create/Edit │ │ View Leave  │ │ Approve/    │
    │ Leave       │ │ History     │ │ Reject      │
    │ Requests    │ │             │ │ Requests    │
    └─────────────┘ └─────────────┘ └─────────────┘
              │             │               │
              └─────────────┼───────────────┘
                            
```

## 🎯 Key Features

### Employee Features
- **Dashboard Overview**: View leave balance, recent requests, and quick statistics
- **Leave Request Management**: Create, edit, and cancel leave requests
- **Request History**: View all submitted requests with status tracking
- **Real-time Updates**: Instant status updates when managers approve/reject
- **Leave Types**: Support for Annual, Sick, Personal, and other leave types

### Manager Features  
- **Manager Dashboard**: Overview of team leave requests and pending approvals
- **Quick Actions**: One-click approve/reject from dashboard
- **Detailed Review**: Comprehensive approval interface with filtering and search
- **Team Overview**: View all team members' leave requests and balances
- **Approval History**: Track all approval decisions

### Shared Features
- **Public Holidays**: View company-wide public holidays
- **Profile Management**: Update personal information
- **Role-based Navigation**: Dynamic menu based on user permissions
- **Responsive Design**: Works on desktop, tablet, and mobile devices

## 🏗️ Technical Architecture

### Frontend Stack
- **Framework**: Angular 17.3.12 with Standalone Components
- **UI/UX**: Bootstrap 5 + Custom CSS
- **Authentication**: JWT Token-based authentication
- **State Management**: RxJS Observables with Services
- **Routing**: Angular Router with Guards (authGuard, roleGuard)
- **HTTP**: Angular HttpClient with Interceptors
- **Build Tool**: Angular CLI with Webpack

### Project Structure
```
src/
├── app/
│   ├── auth/                 # Authentication module
│   │   ├── login/           # Login component
│   │   └── services/        # Auth service & guards
│   ├── dashboard/           # Dashboard components
│   │   ├── employee-dashboard/
│   │   └── manager-dashboard/
│   ├── leave-requests/      # Leave management module
│   │   ├── leave-create/    # Create new requests
│   │   ├── leave-edit/      # Edit pending requests
│   │   ├── leave-list/      # View request history
│   │   ├── leave-detail/    # Request details
│   │   ├── leave-approval/  # Manager approval interface
│   │   └── services/        # Leave request services
│   ├── public-holidays/     # Holiday management
│   ├── shared/              # Shared utilities
│   │   ├── components/      # Reusable components
│   │   ├── guards/          # Route guards
│   │   ├── models/          # TypeScript interfaces
│   │   ├── services/        # Shared services
│   │   └── utils/           # Helper utilities
│   └── core/                # Core services
└── assets/                  # Static assets
```

### API Integration
- **Backend URL**: `http://localhost:5254/api`
- **Authentication**: JWT tokens with role-based access
- **CORS**: Configured for development environment
- **Error Handling**: Centralized error interceptor
- **Data Types**: Centralized type helpers for backend/frontend consistency

### Route Structure
```
/ (redirect to /login)
├── /login                   # Public login page
├── /employee/*              # Employee-protected routes
│   ├── /                   # Employee dashboard
│   ├── /leave-requests     # Leave request management
│   │   ├── /               # Request history
│   │   ├── /create         # Create new request
│   │   ├── /edit/:id       # Edit request
│   │   └── /:id            # Request details
│   ├── /profile            # User profile
│   └── /public-holidays    # View holidays
├── /manager/*               # Manager-protected routes
│   ├── /                   # Manager dashboard
│   ├── /leave-requests     # Approval management
│   │   ├── /               # Pending approvals
│   │   └── /:id            # Request details
│   └── /public-holidays    # View holidays
└── /public-holidays         # Shared holiday view
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- .NET backend running on port 5254

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd leave-management-frontend

# Install dependencies
npm install

# Start development server
npm start
```

### Environment Setup
1. **Backend**: Ensure .NET backend is running on `http://localhost:5254`
2. **CORS**: For development, use Chrome with `--disable-web-security` flag
3. **Database**: Backend should be connected to your database

### User Credentials
- **Employee**: Use employee credentials from your backend
- **Manager**: Use manager credentials from your backend

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

### Development Commands
```bash
# Start development server
npm start
# or
ng serve

# Run with specific port
ng serve --port 4200

# Run tests
npm test
# or  
ng test

# Build for production
npm run build
# or
ng build --configuration production
```

## 🔧 Troubleshooting

### Common Issues

#### CORS Errors
```bash
# Start Chrome with disabled security for development
chrome.exe --user-data-dir="C:/Chrome dev" --disable-web-security --disable-features=VizDisplayCompositor
```

#### Backend Connection Issues
- Verify backend is running on `http://localhost:5254`
- Check API endpoints in services (all should point to direct backend URL)
- Ensure database is connected and seeded with test data

#### Authentication Issues
- Clear browser localStorage: `localStorage.clear()`
- Check JWT token expiry
- Verify user roles are correctly assigned in backend

#### Route Guard Issues
- Ensure user has correct role (Employee/Manager)
- Check browser console for route guard errors
- Verify token is valid and not expired

## 📊 Performance Features

- **Lazy Loading**: Feature modules loaded on demand
- **Server-Side Rendering**: Angular Universal support
- **Optimized Builds**: Production builds with tree-shaking
- **Caching**: HTTP interceptors for API response caching
- **Code Splitting**: Automatic code splitting by Angular CLI

## 🧪 Testing

### Unit Tests
```bash
# Run all unit tests
ng test

# Run tests in watch mode
ng test --watch

# Run tests with coverage
ng test --code-coverage
```

### Test Structure
- **Component Tests**: `*.component.spec.ts`
- **Service Tests**: `*.service.spec.ts`
- **Mock Data**: Test utilities in `shared/testing/`

## 🚀 Deployment

### Production Build
```bash
# Build for production
ng build --configuration production

# Build with specific base href
ng build --base-href "/leave-management/"
```

### Environment Configuration
- **Development**: `src/environments/environment.ts`
- **Production**: `src/environments/environment.prod.ts`

## 📝 Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Check the troubleshooting section above
- Review Angular CLI documentation: `ng help`
- Refer to [Angular CLI Overview and Command Reference](https://angular.io/cli)

---

*Last updated: September 2025*
