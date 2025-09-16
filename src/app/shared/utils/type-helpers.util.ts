import { LeaveType, LeaveStatus, LEAVE_TYPE_LABELS, LEAVE_STATUS_LABELS, LEAVE_STATUS_BADGES } from '../models/leave-request.model';

/**
 * Utility functions to handle mixed types from backend responses
 */

export function getStatusFromValue(status: LeaveStatus | number | undefined): LeaveStatus {
  if (typeof status === 'number') {
    return mapStatusFromNumber(status);
  }
  return status || LeaveStatus.PENDING;
}

export function mapStatusFromNumber(status: number): LeaveStatus {
  // Map numeric status to LeaveStatus enum based on common patterns
  switch (status) {
    case 0: return LeaveStatus.PENDING;
    case 1: return LeaveStatus.APPROVED;
    case 2: return LeaveStatus.REJECTED;
    case 3: return LeaveStatus.CANCELLED;
    default: return LeaveStatus.PENDING;
  }
}

export function getLeaveTypeFromValue(leaveType: LeaveType | string | undefined): LeaveType {
  if (!leaveType) {
    return LeaveType.ANNUAL;
  }
  
  // If it's already a LeaveType enum, return it
  if (Object.values(LeaveType).includes(leaveType as LeaveType)) {
    return leaveType as LeaveType;
  }
  
  // Try to map string to enum
  const upperType = String(leaveType).toUpperCase();
  switch (upperType) {
    case 'ANNUAL': return LeaveType.ANNUAL;
    case 'SICK': return LeaveType.SICK;
    case 'MATERNITY': return LeaveType.MATERNITY;
    case 'PATERNITY': return LeaveType.PATERNITY;
    case 'STUDY': return LeaveType.STUDY;
    case 'FAMILY_RESPONSIBILITY': return LeaveType.FAMILY_RESPONSIBILITY;
    case 'UNPAID': return LeaveType.UNPAID;
    default: return LeaveType.ANNUAL;
  }
}

export function getDateStringValue(dateValue: string | undefined): string {
  return dateValue || '';
}

// Helper functions for display labels
export function getLeaveTypeLabel(type: LeaveType | string | undefined): string {
  const safeType = getLeaveTypeFromValue(type);
  return LEAVE_TYPE_LABELS[safeType] || safeType.toString();
}

export function getStatusLabel(status: LeaveStatus | number | undefined): string {
  const safeStatus = getStatusFromValue(status);
  return LEAVE_STATUS_LABELS[safeStatus] || safeStatus.toString();
}

export function getStatusBadgeClass(status: LeaveStatus | number | undefined): string {
  const safeStatus = getStatusFromValue(status);
  return LEAVE_STATUS_BADGES[safeStatus] || 'bg-secondary';
}

export function formatDate(dateString: string | undefined): string {
  const safeDateString = getDateStringValue(dateString);
  if (!safeDateString) return '';
  
  try {
    const date = new Date(safeDateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch {
    return safeDateString;
  }
}