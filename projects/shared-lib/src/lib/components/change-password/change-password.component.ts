import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  imports:[ReactiveFormsModule],
  styleUrls: ['./change-password.component.scss']
})
export class ChangePasswordComponent implements OnInit {
passwordForm: FormGroup;
  showCurrentPassword: boolean=false;
  showNewPassword: boolean=false;
  showConfirmPassword: boolean=false;

  constructor(private fb: FormBuilder) {
    this.passwordForm = this.fb.group({
      currentPassword: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    });
   }

  ngOnInit() {
  }
 onSubmit() {
    if (this.passwordForm.invalid) {
      return;
    }
      const formData = this.passwordForm.value;
    console.log('Password Data:', formData);
  }
  passwordToggle(type:any){
if (type == 'current') {
  this.showCurrentPassword = !this.showCurrentPassword;
}
else if(type == 'new'){
  this.showNewPassword = !this.showNewPassword;

}
else if(type == 'reEnter'){
  this.showConfirmPassword = !this.showConfirmPassword;

}
  }
}
