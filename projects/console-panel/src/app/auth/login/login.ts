import { HttpClientModule } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { DataService } from 'shared-lib';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-login',
  imports: [HttpClientModule,
    ReactiveFormsModule,


  ],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login {
  loginForm!:FormGroup;
  public dataService:any= inject(DataService);
  private activatedRoute= inject(ActivatedRoute);
  public router=inject(Router)
  submitted: boolean=false;
  constructor(public fb:FormBuilder){
this.loginFormGrp();
  }
 //add toastr library private activatedRoute= inject(ActivatedRoute);
  // email:any='superadmin@demohandler.com'
  // password:any='R9!hQ7k$2Pm@A1eZx4LwT8uV#cN0sBf'
  // password:Admin@12345
  // callLogin() {

  //   const loginData = {
  //     email: this.email,
  //     password: this.password
  //   };
    
  //   this.dataService.callApi(loginData, 'login').pipe(
  //     catchError((error) => {
  //       console.error('Error occurred during login:', error);
  //      //add toaserfnc alert('Login failed: ' + response.message);
  //       // Optionally, you can return an observable to prevent further execution
  //       return of(null); // or you can return a default value if needed
  //     })
  //   ).subscribe((response: any) => {
  //     console.log('Login Response:', response);
    
  //     if (response && response.success) {
  //       localStorage.setItem('user', JSON.stringify(response.data));
  //       this.router.navigate(['dashboard']);
  //     } else if (response) {
  //      //add toaserfnc alert('Login failed: ' + response.message);
  //     }
  //   });
    
  // }
  loginFormGrp(){
      this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      remeberMe: [false]
    });
  }
  goToLogin(){
    console.log('this.loginForm==>',this.loginForm);
    this.submitted = true;
    if (this.loginForm.invalid) {
      return;
    }
    this.dataService.callApi(this.loginForm.value, 'login').pipe(
      catchError((error) => {
        console.error('Error occurred during login:', error);
       //add toaserfnc alert('Login failed: ' + response.message);
        // Optionally, you can return an observable to prevent further execution
        return of(null); // or you can return a default value if needed
      })
    ).subscribe((response: any) => {
      console.log('Login Response:', response);
    
      if (response && response.success) {
        localStorage.setItem('user', JSON.stringify(response.data));
        this.router.navigate(['dashboard']);
      } else if (response == null) {
        alert('Invalid user, try valid email');
       //add toaserfnc alert('Login failed: ' + response.message);
      }
    });
  }
  get f() {
    return this.loginForm.controls;
  }
}
