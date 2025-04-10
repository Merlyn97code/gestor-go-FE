export interface Tenant {
    tenantId: number;
    name: string;
    phone: string;
    email: string;
    address: string;
    createdAt: string;
    updatedAt: string;
  }
  
  export interface User {
    id: number;
    tenant: Tenant;
    username: string;
    password: string;
    enabled: boolean;
    createdAt: string;
    updatedAt: string;
    roleId: string | null;
  }