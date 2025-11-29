import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { FormArray, FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { DataService } from 'shared-lib';
import { catchError, of } from 'rxjs';

@Component({
  selector: 'app-auth',
  imports: [ CommonModule,CommonModule,FormsModule,ReactiveFormsModule ],
  templateUrl: './auth.html',
  styleUrl: './auth.scss'
})
export class Auth {
  public dataService: any = inject(DataService);
  isLogin: Boolean=true;
  isSignUp: Boolean=false;
  forgotPassword: Boolean=false;
  startLoginWindow:boolean = false;
  signupForm!:FormGroup;
  loginform!:FormGroup;
   constructor(private fb:FormBuilder,private router: Router){
    this.loginForm();
   }


   loginForm(){
    this.loginform = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],

    })
  }
  login() {
        console.log('this.signupForm==>',this.loginform.invalid);
    
    if (this.loginform.invalid) {
      // this.loginform.markAllAsTouched();
      return;
    }
    else{
        this.dataService.callApiNew(this.loginform.value, 'auth/login')
      .pipe(
        catchError(err => {
          console.error('Error:', err);

          return of(null);
        })
      )
      .subscribe((res: any) => {
        console.log('Response:', res);
  //  let popupData = {
  //     title: 'Login Successfully',
  //     description: 'Do you want to loggedIn',
  //   }
        if (res.success == true) {   
           this.router.navigate(['/home']); 
  // let dialogRef = this.dialog.open(DynamicPopup, {
  //     width: '250px',
  //     data: popupData,
  //   });
  //   dialogRef.afterClosed().subscribe(result => {
  //     console.log('Dialog closed with:', result);

  //     if (result.action === 'ok') {
  //       localStorage.setItem('user', JSON.stringify(res.data));
  //       dialogRef.close();
  //       this.router.navigate(['/landing'])
  //       window.location.reload();
  //       // Perform delete
  //     }
    // })
        }
 
        // this.addCategory.reset();
        // this.imagePreview = '';
        // this.imageFile = null;
        // this.getCategoryList();
      });
    }

  }
  loginOrSignupPage(){
    this.startLoginWindow = true;
  }
  signupPage(){
    this.isSignUp = true;
    this.isLogin = false;
  }
}
