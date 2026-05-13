import { Injectable } from '@angular/core';
import { BehaviorSubject, map } from 'rxjs';
import { NewUser, RoleDistribution, User } from '../models/user.model';

@Injectable({
    providedIn: 'root',
})
export class UserService {
    private readonly usersSubject = new BehaviorSubject<User[]>([
        { id: 1, name: 'Aarav Sharma', email: 'aarav.sharma@example.com', role: 'Admin' },
        { id: 2, name: 'Diya Mehta', email: 'diya.mehta@example.com', role: 'Editor' },
        { id: 3, name: 'Rohan Verma', email: 'rohan.verma@example.com', role: 'Viewer' },
        { id: 4, name: 'Ananya Nair', email: 'ananya.nair@example.com', role: 'Editor' },
    ]);

    private nextId = 5;

    readonly users$ = this.usersSubject.asObservable();

    readonly roleDistribution$ = this.users$.pipe(
        map((users) => this.calculateRoleDistribution(users)),
    );

    addUser(newUser: NewUser): void {
        const user: User = {
            id: this.nextId++,
            name: newUser.name.trim(),
            email: newUser.email.trim().toLowerCase(),
            role: newUser.role,
        };

        const updatedUsers = [...this.usersSubject.value, user];
        this.usersSubject.next(updatedUsers);
    }

    private calculateRoleDistribution(users: User[]): RoleDistribution {
        return users.reduce<RoleDistribution>(
            (summary, user) => {
                summary[user.role] += 1;
                return summary;
            },
            { Admin: 0, Editor: 0, Viewer: 0 },
        );
    }
}
