export type UserRole = 'Admin' | 'Editor' | 'Viewer';

export interface User {
    id: number;
    name: string;
    email: string;
    role: UserRole;
}

export type NewUser = Omit<User, 'id'>;

export type RoleDistribution = Record<UserRole, number>;
