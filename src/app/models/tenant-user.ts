export interface Tenant {
  name: string,
  phone: string,
  whatsAppNumber: string,
  email: string,
  address: string,
  businessSchedules?: BusinessSchedule[];
}

export interface Person {
  firstName: string,
  lastName: string,
  phone: string,
  email: string,
  address?: string
}

export interface User {
  username: string,
  password: string,
  roleId: number,
  enabled: boolean
}

export interface Register {
  tenant: Tenant,
  person: Person,
  userEntity: User
  token?: string,
}

export interface BusinessSchedule {
  dayOfWeek: string;
  openTime: string;
  closeTime: string;
  breakStartTime: string;
  breakEndTime: string;
  specialSchedule: string;
  nonWorkingDay: boolean;
}