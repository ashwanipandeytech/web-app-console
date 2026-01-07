import { ChangeDetectorRef, Component, inject, ViewEncapsulation } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { catchError, of } from 'rxjs';
import { DataService } from '../../../services/data-service';
import { SignalService } from '../../../services/signal-service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Router, ActivatedRoute } from '@angular/router';
import { GlobaCommonlService } from '../../../services/global-common.service';
import { GlobalFunctionService } from '../../../services/global-function.service';
import { CommonModule } from '@angular/common';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
@Component({
  selector: 'web-login',
  imports: [FormsModule, ReactiveFormsModule, CommonModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
  encapsulation: ViewEncapsulation.None,
})
export class Login {
  public dataService: any = inject(DataService);
  public globalService: any = inject(GlobaCommonlService);
  public activeModal = inject(NgbActiveModal);
  public globalFunctionService: any = inject(GlobalFunctionService);
  public signalService: any = inject(SignalService);
  private cd = inject(ChangeDetectorRef);
  // readonly dialog = inject(MatDialog);
  
  isSignUp = false;
  signupForm!: FormGroup;
  loginform!: FormGroup;
  submitted: boolean = false;
  submittedRegister: boolean = false;
  isCheckoutPage: boolean = false;
  showCurrentPassword: boolean = false;
  showNewPassword: boolean = false;
  showConfirmPassword: boolean = false;
  enableDisableSignUp() {
    this.isSignUp = !this.isSignUp;
  }

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {
    this.activatedRoute.queryParams.subscribe((params) => {
      this.isCheckoutPage = params['checkout'] === 'true' ? true : false;

      console.log(this.isCheckoutPage);
    });
    console.info(this.router);
    this.signUpForm();
    this.loginForm();
  }
  signUpForm() {
    this.signupForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: [
        '',
        [
          Validators.pattern(/^[0-9]{10}$/), // only 10 digits allowed
        ],
      ],

      // phone: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      password_confirmation: ['', Validators.required],
      remember: [false],
    });
  }
  loginForm() {
    this.loginform = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }
  addAddress(address:any){
     this.dataService.post(address, 'addresses')
       .pipe(
         catchError(err => {
           console.error('Error:', err);
           return of(null);
         })
       )
       .subscribe((res: any) => {
         console.log('Response:', res);
         if (res.success == true) {  
          this.closePopup(); 
          //  this.globalService.showMsgSnackBar(res);
         }
       });
  }
  register() {
    console.log('this.signupForm==>', this.signupForm.invalid);
    this.submittedRegister = true;
    if (this.signupForm.invalid) {
      // this.signupForm.markAllAsTouched();
      return;
    } else {
    let isNonUserToken: any = JSON.parse(localStorage.getItem('GUEST_TOKEN') || 'null');
       let formData = this.signupForm.value;
      formData.guest_token = isNonUserToken;
      this.dataService
        .post(formData, 'auth/register')
        .pipe(
          catchError((err) => {
            console.error('Error:', err);

            return of(err);
          })
        )
        .subscribe((res: any) => {
          // console.log('Response:', res);
          if (res.success == true) {
            this.globalService.showMsgSnackBar(res);
            localStorage.setItem('user', JSON.stringify(res.data));
            // let tempAddress: any = JSON.parse(localStorage.getItem('tempAddress') || 'null');
              // if (tempAddress !=null) {
              //   this.addAddress(tempAddress);
              // }
              // let isNonUserToken: any = JSON.parse(localStorage.getItem('GUEST_TOKEN') || 'null');
            if (isNonUserToken) {
              localStorage.removeItem('GUEST_TOKEN');
            }
            //make a signal for emiting the user state
            localStorage.setItem('isLoggedIn', JSON.stringify(true));
            this.globalFunctionService.getCount();

            //make a signal for emiting the user state
            // let redirectTo = '/';
            // if (this.isCheckoutPage) {
            //   redirectTo = '/checkout';
            // }

            // this.router.navigate([redirectTo]).then(() => {
            //   window.location.reload(); // Reload the page after navigating
            // });
            setTimeout(() => {
              this.closePopup();
            }, 0);
          } else if (res.error && res.error.message) {
            console.log('error  :', res.error.message);
            // this.globalService.showMsgSnackBar(res.error);
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
  closePopup(){
    this.activeModal.close({result:'success'});
    console.log('enter login');
    
    this.cd.detectChanges();
  }
  loginUser() {
    let isNonUserToken: any = JSON.parse(localStorage.getItem('GUEST_TOKEN') || 'null');
        // if (isNonUserToken) {
        //   localStorage.removeItem('GUEST_TOKEN');
        // }
    this.submitted = true;
    if (this.loginform.invalid) {
      // this.loginform.markAllAsTouched();
      return;
    } else {
      let formData = this.loginform.value;
      formData.guest_token = isNonUserToken;
      this.dataService
        .post(formData, 'auth/login')
        .pipe(
          catchError((err) => {
            console.error('Error:', err);

            return of(err);
          })
        )
        .subscribe((res: any) => {
          // console.log('Response:', res.error.message);
          if (res.success == true) {
            this.globalService.showMsgSnackBar(res);
              //  let tempAddress: any = JSON.parse(localStorage.getItem('tempAddress') || 'null');
              // if (tempAddress !=null) {
              //   this.addAddress(tempAddress);
              // }
            // localStorage.setItem('user', JSON.stringify(res.data));
            // let isNonUserToken: any = JSON.parse(localStorage.getItem('GUEST_TOKEN') || 'null');
            // if (isNonUserToken) {
              localStorage.removeItem('GUEST_TOKEN');

            // }
            //make a signal for emiting the user state
            localStorage.setItem('user', JSON.stringify(res.data));
            localStorage.setItem('isLoggedIn', JSON.stringify(true));
            this.globalFunctionService.getCount();
            this.signalService.userLoggedIn.set(true);
           setTimeout(() => {
            
             this.closePopup();
           }, 0);
          } else if (res.error && res.error.message) {
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

  loginWithGoogle() {
    let endpoint = 'auth/google/redirect?redirect=/landing';
    this.dataService.get(endpoint).subscribe((res: any) => {
      console.log('res===>', res);
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
}
