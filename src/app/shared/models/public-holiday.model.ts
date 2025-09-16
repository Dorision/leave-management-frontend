export interface PublicHoliday {
  id: string;
  name: string;
  date: Date;
  description?: string;
  isRecurring: boolean;
  country?: string;
  region?: string;
  createdAt: Date;
  updatedAt: Date;
}