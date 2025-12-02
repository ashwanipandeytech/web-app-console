
import { Component, inject } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { catchError, of } from 'rxjs';
import { DataService } from 'shared-lib';
import { DynamicPopup } from '../../../../../shared-lib/src/lib/components/confirmationPopup/confirmationPopup.component';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { GlobaCommonlService } from '../../../../../global-common.service';
@Component({
  selector: 'web-login',
  imports: [FormsModule, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login {
  public dataService: any = inject(DataService);
  public globalService:any = inject(GlobaCommonlService);
   readonly dialog = inject(MatDialog);
isSignUp = false;
signupForm!:FormGroup;
loginform!:FormGroup;
submitted: boolean=false;
  enableDisableSignUp(){
this.isSignUp = !this.isSignUp;
  }

  constructor(private fb:FormBuilder,private router: Router){
this.signUpForm();
this.loginForm();
  }
  signUpForm(){
     this.signupForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
     phone: ['',[Validators.pattern(/^[0-9]{10}$/) // only 10 digits allowed
      ]
],

      // phone: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      password_confirmation: ['', Validators.required],
      remember: [false]
    });
  }
  loginForm(){
    this.loginform = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],

    })
  }
  register() {
    console.log('this.signupForm==>',this.signupForm.invalid);
    this.submitted = true;
    if (this.signupForm.invalid) {
      // this.signupForm.markAllAsTouched();
      return;
    }
    else{
        this.dataService.callApiNew(this.signupForm.value, 'auth/register')
      .pipe(
        catchError(err => {
          console.error('Error:', err);

          return of(err);
        })
      )
      .subscribe((res: any) => {
        // console.log('Response:', res);
        if (res.success ==true) {
          this.globalService.showMsgSnackBar(res);
        localStorage.setItem('user', JSON.stringify(res.data));
        this.router.navigate(['/landing']);
        window.location.reload();
        }
        else if (res.error && res.error.message) {
        console.log('error  :', res.error.message);
          this.globalService.showMsgSnackBar(res.error);
        }


        // if (res.success ==true) {    
        //   let id = res.data.id;
        // }
 
        // this.addCategory.reset();
        // this.imagePreview = '';
        // this.imageFile = null;
        // this.getCategoryList();
      });
    }
    // console.log("Form Data:", this.signupForm.value);
  }
  loginUser(){
        console.log('this.signupForm==>',this.loginform.invalid);
     this.submitted = true;
    if (this.loginform.invalid) {
      // this.loginform.markAllAsTouched();
      return;
    }
    else{
        this.dataService.callApiNew(this.loginform.value, 'auth/login')
      .pipe(
        catchError(err => {
          console.error('Error:', err);

          return of(err);
        })
      )
      .subscribe((res: any) => {
        // console.log('Response:', res.error.message);
        if (res.success ==true) {
          this.globalService.showMsgSnackBar(res);
        localStorage.setItem('user', JSON.stringify(res.data));
        this.router.navigate(['/landing'])
        window.location.reload();
        }
        else if (res.error && res.error.message) {
        console.log('error  :', res.error.message);
          this.globalService.showMsgSnackBar(res.error);
        }

  //  let popupData = {
  //     title: 'Login Successfully',
  //     description: 'Do you want to loggedIn',
  //   }
  //       if (res.success == true) {    
  // let dialogRef = this.dialog.open(DynamicPopup, {
  //     width: '250px',
  //     data: popupData,
  //   });
  //   dialogRef.afterClosed().subscribe(result => {
  //     console.log('Dialog closed with:', result);

  //     if (result.action === 'ok') {

  //       // Perform delete
  //     }
  //   })
  //       }
 
        // this.addCategory.reset();
        // this.imagePreview = '';
        // this.imageFile = null;
        // this.getCategoryList();
      });
    }
  }
    get f() {
    return this.loginform.controls;
  }
      get s() {
    return this.signupForm.controls;
  }
}
