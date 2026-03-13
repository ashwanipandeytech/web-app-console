import {
  ChangeDetectorRef,
  Component,
  inject,
  Input,
  ViewEncapsulation,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { catchError, of } from 'rxjs';
import { DataService } from '../../../services/data-service';
import { SignalService } from '../../../services/signal-service';
import { GlobaCommonlService } from '../../../services/global-common.service';
import { GlobalFunctionService } from '../../../services/global-function.service';
import { CommonModule } from '@angular/common';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'web-set-password',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, CommonModule],
  templateUrl: './set-password.html',
  styleUrl: './set-password.scss',
  encapsulation: ViewEncapsulation.None,
})
export class SetPassword {
  public dataService = inject(DataService);
  public globalService = inject(GlobaCommonlService);
  public activeModal = inject(NgbActiveModal);
  public globalFunctionService = inject(GlobalFunctionService);
  public signalService = inject(SignalService);
  private fb = inject(FormBuilder);
  private cd = inject(ChangeDetectorRef);

  @Input() userData: any;

  setPasswordForm!: FormGroup;
  submitted = false;
  showPassword = false;
  showConfirmPassword = false;

  constructor() {
    this.initSetPasswordForm();
  }

  initSetPasswordForm() {
    this.setPasswordForm = this.fb.group(
      {
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', Validators.required],
      },
      { validators: this.passwordMatch }
    );
  }

  passwordMatch(group: FormGroup) {
    return group.get('password')?.value === group.get('confirmPassword')?.value
      ? null
      : { mismatch: true };
  }

  setPassword() {
    this.submitted = true;
    if (this.setPasswordForm.invalid) return;

    const payload = {
      email: this.userData?.email,
      token: this.userData?.token || '',
      password: this.setPasswordForm.value.password,
      password_confirmation: this.setPasswordForm.value.confirmPassword,
    };

    this.dataService
      .post(payload, 'auth/set-password')
      .pipe(
        catchError((err) => {
          console.error('Error:', err);
          return of(null);
        })
      )
      .subscribe((res: any) => {
        if (res.success == true) {
          this.globalService.showToast(res);
          this.activeModal.close({ result: 'success' });
        } else if (res.error && res.error.message) {
            this.globalService.showToast(res.error);
        }
      });
  }

  passwordToggle(type: 'password' | 'confirm') {
    if (type === 'password') {
      this.showPassword = !this.showPassword;
    } else {
      this.showConfirmPassword = !this.showConfirmPassword;
    }
  }

  closePopup() {
    this.activeModal.dismiss();
  }
}
