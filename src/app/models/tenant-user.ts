export interface Tenant {
  name: string,
  phone: string,
  whatsAppNumber: string,
  email: string,
  address: string
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
  user: User
}