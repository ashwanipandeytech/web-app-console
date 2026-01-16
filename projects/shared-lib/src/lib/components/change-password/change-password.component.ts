import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DataService } from '../../services/data-service';
import { catchError, of } from 'rxjs';
import { GlobaCommonlService } from '../../services/global-common.service';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  imports: [ReactiveFormsModule, CommonModule],
  styleUrls: ['./change-password.component.scss'],
})
export class ChangePasswordComponent implements OnInit {
  passwordForm: FormGroup;
  private dataService = inject(DataService);
  private globalService = inject(GlobaCommonlService);
  showCurrentPassword: boolean = false;
  showNewPassword: boolean = false;
  showConfirmPassword: boolean = false;

  constructor(private fb: FormBuilder) {
    this.passwordForm = this.fb.group({
      currentPassword: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
    });
  }

  ngOnInit() {}
  onSubmit() {
    // if user logged in by facebook or gmail
    //  let payload = {
    //   password: formData.password,
    //   password_confirmation: formData.confirmPassword
    // }
    // this.setPassword(payload);
    // console.log('this.passwordForm===>', this.passwordForm.value);

    // if (this.passwordForm.invalid) {
    //   return;
    // }
    const formData = this.passwordForm.value;
    //console.log('Password Data:', formData);
    let payload = {
      old_password: formData.currentPassword,
      new_password: formData.password,
      new_password_confirmation: formData.confirmPassword,
    };
    this.dataService
      .post(payload, 'auth/change-password')
      .pipe(
        catchError((err) => {
          console.error('Error:', err);
          return of(err);
        })
      )
      .subscribe((res: any) => {
        //console.log('Response:', res);
        if (res.success == true) {
          this.globalService.showMsgSnackBar(res);
          this.passwordForm.reset();

          // this.router.navigate(['/cart']);
        } else if (res.error && res.error.message) {
          this.globalService.showMsgSnackBar(res.error);
        }
      });
  }
  setPassword(payload: any) {
    // if(payload.currentPassword==payload.new_password){
    //   let data={
    //     message:'Please Use Different Password',
    //     success:false
    //   }
    //     this.globalService.showMsgSnackBar(data);
    // }
    // return
    this.dataService
      .post(payload, 'auth/set-password')
      .pipe(
        catchError((err) => {
          console.error('Error:', err);
          return of(null);
        })
      )
      .subscribe((res: any) => {
        //console.log('Response:', res);
        if (res.success == true) {
        } else if (res.error && res.error.message) {
        }
      });
  }
  passwordToggle(type: any) {
    if (type == 'current') {
      this.showCurrentPassword = !this.showCurrentPassword;
    } else if (type == 'new') {
      this.showNewPassword = !this.showNewPassword;
    } else if (type == 'reEnter') {
      this.showConfirmPassword = !this.showConfirmPassword;
    }
  }


  checkPassword(value : any){
    // console.log(value)
  }


  
}
