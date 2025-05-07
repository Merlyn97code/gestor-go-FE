export interface BusinessService {
    id: number;
    serviceName?: string;
    description?: string;
    price?: number; 
    tenantId?: number;
    tenant?: any;
  }