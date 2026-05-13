import { AsyncPipe, CommonModule } from '@angular/common';
import {
    ChangeDetectorRef,
    Component,
    ComponentRef,
    inject,
    OnDestroy,
    Type,
    ViewChild,
    ViewContainerRef,
} from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { combineLatest, map, startWith } from 'rxjs';
import { NewUser, User } from '../../core/models/user.model';
import { UserService } from '../../core/services/user.service';
import { RolePieChartComponent } from '../../shared/role-pie-chart/role-pie-chart.component';

@Component({
    selector: 'app-user-dashboard',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, AsyncPipe, RolePieChartComponent],
    templateUrl: './user-dashboard.component.html',
    styleUrl: './user-dashboard.component.scss',
})
export class UserDashboardComponent implements OnDestroy {
    @ViewChild('modalHost', { read: ViewContainerRef })
    private modalHost?: ViewContainerRef;

    private readonly userService = inject(UserService);
    private readonly changeDetectorRef = inject(ChangeDetectorRef);

    readonly users$ = this.userService.users$;
    readonly roleDistribution$ = this.userService.roleDistribution$;

    readonly searchControl = new FormControl('', { nonNullable: true });

    readonly filteredUsers$ = combineLatest([
        this.users$,
        this.searchControl.valueChanges.pipe(startWith('')),
    ]).pipe(
        map(([users, term]) => {
            const normalizedTerm = term.trim().toLowerCase();
            if (!normalizedTerm) {
                return users;
            }

            return users.filter(
                (user) =>
                    user.name.toLowerCase().includes(normalizedTerm) ||
                    user.email.toLowerCase().includes(normalizedTerm) ||
                    user.role.toLowerCase().includes(normalizedTerm),
            );
        }),
    );

    isAddUserModalOpen = false;

    private formComponentRef: ComponentRef<unknown> | null = null;
    private lazyFormComponent: Type<unknown> | null = null;

    async openAddUserModal(): Promise<void> {
        this.isAddUserModalOpen = true;
        this.changeDetectorRef.detectChanges();
        await this.mountLazyFormComponent();
    }

    closeAddUserModal(): void {
        this.formComponentRef?.destroy();
        this.formComponentRef = null;
        this.modalHost?.clear();
        this.isAddUserModalOpen = false;
    }

    trackByUserId(_: number, user: User): number {
        return user.id;
    }

    ngOnDestroy(): void {
        this.formComponentRef?.destroy();
    }

    private async mountLazyFormComponent(): Promise<void> {
        if (!this.modalHost) {
            return;
        }

        this.modalHost.clear();

        if (!this.lazyFormComponent) {
            const module = await import('./user-form/user-form.component');
            this.lazyFormComponent = module.UserFormComponent;
        }

        this.formComponentRef = this.modalHost.createComponent(this.lazyFormComponent);

        const formInstance = this.formComponentRef.instance as {
            submitted: { subscribe: (listener: (user: NewUser) => void) => void };
            cancelled: { subscribe: (listener: () => void) => void };
        };

        formInstance.submitted.subscribe((user) => {
            this.userService.addUser(user);
            this.closeAddUserModal();
        });

        formInstance.cancelled.subscribe(() => {
            this.closeAddUserModal();
        });
    }
}
