export interface Roles {
    roleId: number,
    name: RoleName,
    description: string
}

export enum RoleName {
    ADMIN = 'ADMIN', 
    WORKER = 'WORKER',
     PATIENT = 'PATIENT'
}