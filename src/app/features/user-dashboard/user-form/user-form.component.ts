import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Output } from '@angular/core';
import {
    FormBuilder,
    ReactiveFormsModule,
    Validators,
} from '@angular/forms';
import { NewUser, UserRole } from '../../../core/models/user.model';

@Component({
    selector: 'app-user-form',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './user-form.component.html',
    styleUrl: './user-form.component.scss',
})
export class UserFormComponent {
    @Output() readonly submitted = new EventEmitter<NewUser>();
    @Output() readonly cancelled = new EventEmitter<void>();

    private readonly formBuilder = inject(FormBuilder);

    readonly roles: UserRole[] = ['Admin', 'Editor', 'Viewer'];

    readonly userForm = this.formBuilder.nonNullable.group({
        name: ['', [Validators.required, Validators.minLength(2)]],
        email: ['', [Validators.required, Validators.email]],
        role: ['Viewer' as UserRole, [Validators.required]],
    });

    onSubmit(): void {
        if (this.userForm.invalid) {
            this.userForm.markAllAsTouched();
            return;
        }

        this.submitted.emit(this.userForm.getRawValue());
    }

    onCancel(): void {
        this.cancelled.emit();
    }

    fieldInvalid(fieldName: 'name' | 'email' | 'role'): boolean {
        const control = this.userForm.controls[fieldName];
        return control.invalid && (control.dirty || control.touched);
    }
}
