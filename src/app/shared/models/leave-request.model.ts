export interface LeaveRequest {
  id: string;
  userId: string;
  user?: {
    firstName: string;
    lastName: string;
    email: string;
    department?: string;
  };
  leaveType: LeaveType;
  startDate: string; // ISO date string
  endDate: string; // ISO date string
  days: number;
  reason: string;
  status: LeaveStatus;
  submittedAt: string; // ISO date string
  approvedBy?: string;
  approvedAt?: string; // ISO date string
  rejectedBy?: string;
  rejectedAt?: string; // ISO date string
  rejectionReason?: string;
  managerComment?: string;
}

export interface CreateLeaveRequest {
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  reason: string;
}

export interface UpdateLeaveRequest {
  leaveType?: LeaveType;
  startDate?: string;
  endDate?: string;
  reason?: string;
}

export interface LeaveDecision {
  status: LeaveStatus.APPROVED | LeaveStatus.REJECTED;
  managerComment?: string;
}

export enum LeaveType {
  ANNUAL = 'ANNUAL',
  SICK = 'SICK',
  MATERNITY = 'MATERNITY',
  PATERNITY = 'PATERNITY',
  STUDY = 'STUDY',
  FAMILY_RESPONSIBILITY = 'FAMILY_RESPONSIBILITY',
  UNPAID = 'UNPAID'
}

export enum LeaveStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED'
}

export const LEAVE_TYPE_LABELS: Record<LeaveType, string> = {
  [LeaveType.ANNUAL]: 'Annual Leave',
  [LeaveType.SICK]: 'Sick Leave',
  [LeaveType.MATERNITY]: 'Maternity Leave',
  [LeaveType.PATERNITY]: 'Paternity Leave',
  [LeaveType.STUDY]: 'Study Leave',
  [LeaveType.FAMILY_RESPONSIBILITY]: 'Family Responsibility',
  [LeaveType.UNPAID]: 'Unpaid Leave'
};

export const LEAVE_STATUS_LABELS: Record<LeaveStatus, string> = {
  [LeaveStatus.PENDING]: 'Pending',
  [LeaveStatus.APPROVED]: 'Approved',
  [LeaveStatus.REJECTED]: 'Rejected',
  [LeaveStatus.CANCELLED]: 'Cancelled'
};

export const LEAVE_STATUS_BADGES: Record<LeaveStatus, string> = {
  [LeaveStatus.PENDING]: 'bg-warning',
  [LeaveStatus.APPROVED]: 'bg-success',
  [LeaveStatus.REJECTED]: 'bg-danger',
  [LeaveStatus.CANCELLED]: 'bg-secondary'
};