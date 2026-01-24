import {
  ChangeDetectorRef,
  Component,
  inject,
  Input,
  Output,
  ViewEncapsulation,
  Inject, // Add Inject
  PLATFORM_ID // Add PLATFORM_ID
} from '@angular/core';
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
import { CommonModule, isPlatformBrowser } from '@angular/common'; // Add isPlatformBrowser
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { environment } from 'environments/environment';
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
  forgotStep!: 'select' | 'phone' | 'otp' | 'reset-password' | 'email';
  // readonly dialog = inject(MatDialog);
  @Output() loginData: any;
  isSignUp = false;
  signupForm!: FormGroup;
  loginform!: FormGroup;
  forgotPhoneForm!: FormGroup;
  otpForm!: FormGroup;
  submitted: boolean = false;
  submittedRegister: boolean = false;
  isCheckoutPage: boolean = false;
  showCurrentPassword: boolean = false;
  showNewPassword: boolean = false;
  showConfirmPassword: boolean = false;
  isForgotPwd: boolean = false;
  forgotEmailForm!: FormGroup;
  resetPasswordForm!: FormGroup;
  resetPasswordVia: any;
  enableDisableSignUp() {
    this.isSignUp = !this.isSignUp;
  }
  isBrowser: boolean; // Add this
private platformId = inject(PLATFORM_ID);
  constructor(
    private fb: FormBuilder,
    private router: Router,
    private activatedRoute: ActivatedRoute,
     // Add this
  ) {
    this.activatedRoute.queryParams.subscribe((params) => {
      this.isCheckoutPage = params['checkout'] === 'true' ? true : false;

      //console.log(this.isCheckoutPage);
    });
    this.isBrowser = isPlatformBrowser(this.platformId); // Add this
    console.info(this.router);
    this.signUpForm();
    this.loginForm();
    this.initForgotPasswordForm();
  }
  ngOnInit() {
    //console.log('data==>',this.loginData);
    if (this.loginData) {
      this.isForgotPwd = true;
      this.forgotStep = 'reset-password';
    }
  }
  timer = 60;
  otpTimerRunning = false;
  interval: any;

  startOtpTimer() {
    this.timer = 60;
    this.otpTimerRunning = true;

    this.interval = setInterval(() => {
      this.timer--;
      this.cd.detectChanges();
      if (this.timer === 0) {
        clearInterval(this.interval);
        this.otpTimerRunning = false;
        this.cd.detectChanges();
      }
    }, 1000);
  }
  sendOtp(via: any = '') {
    if (this.forgotEmailForm.invalid) return;
    let payload = {
      email: this.forgotEmailForm.value.email,
      via: via,
    };
    this.dataService
      .post(payload, 'auth/forgot-password')
      .pipe(
        catchError((err) => {
          console.error('Error:', err);
          return of(null);
        })
      )
      .subscribe((res: any) => {
        if (res.success == true) {
          //console.log('Response:', res);
          if (via == 'otp') {
            this.startOtpTimer();
            this.forgotStep = 'otp';
          } else {
            this.closePopup();
          }
          this.globalService.showMsgSnackBar(res);
        }
      });
    // API CALL: send OTP
  }
  resendOtp() {
    this.startOtpTimer();
    // this.forgotStep = 'otp';
    let payload = {
      email: this.forgotEmailForm.value.email,
      type: 'forgot_password',
    };
    this.dataService
      .post(payload, 'auth/resend-otp')
      .pipe(
        catchError((err) => {
          console.error('Error:', err);
          return of(null);
        })
      )
      .subscribe((res: any) => {
        if (res.success == true) {
          //console.log('Response:', res);
          this.globalService.showMsgSnackBar(res);
        }
      });
  }

  setPassword() {
    let payload: any;
    let apiUrl: any;
    if (this.resetPasswordForm.invalid) return;
    if (this.resetPasswordVia == 'otp') {
      payload = {
        email: this.forgotEmailForm.value.email,
        password: this.resetPasswordForm.value.password,
        password_confirmation: this.resetPasswordForm.value.confirmPassword,
      };
      apiUrl = 'auth/reset-password';
    } else {
      payload = {
        email: this.loginData?.email,
        token: this.loginData?.token,
        password: this.resetPasswordForm.value.password,
        password_confirmation: this.resetPasswordForm.value.confirmPassword,
      };
      apiUrl = 'auth/reset-password-token';
    }
    this.dataService
      .post(payload, apiUrl)
      .pipe(
        catchError((err) => {
          console.error('Error:', err);
          return of(null);
        })
      )
      .subscribe((res: any) => {
        if (res.success == true) {
          //console.log('Response:', res);
          this.globalService.showMsgSnackBar(res);
          this.closePopup();
        }
      });
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
      remember: [false],
    });
  }
  addAddress(address: any) {
    this.dataService
      .post(address, 'addresses')
      .pipe(
        catchError((err) => {
          console.error('Error:', err);
          return of(null);
        })
      )
      .subscribe((res: any) => {
        //console.log('Response:', res);
        if (res.success == true) {
          this.closePopup();
          //  this.globalService.showMsgSnackBar(res);
        }
      });
  }
  register() {
    //console.log('this.signupForm==>', this.signupForm.invalid);
    this.submittedRegister = true;
    if (this.signupForm.invalid) {
      // this.signupForm.markAllAsTouched();
      return;
    } else {
      let isNonUserToken: any = null;
      if (this.isBrowser) {
        isNonUserToken = JSON.parse(localStorage.getItem('GUEST_TOKEN') || 'null');
      }
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
          // //console.log('Response:', res);
          if (res.success == true) {
            this.globalService.showMsgSnackBar(res);
            if (this.isBrowser) {
              localStorage.setItem('user', JSON.stringify(res.data));
            }
            this.signalService.user.set(res.data);

            // let tempAddress: any = JSON.parse(localStorage.getItem('tempAddress') || 'null');
            // if (tempAddress !=null) {
            //   this.addAddress(tempAddress);
            // }
            // let isNonUserToken: any = JSON.parse(localStorage.getItem('GUEST_TOKEN') || 'null');
            if (isNonUserToken) {
              if (this.isBrowser) {
            if (this.isBrowser) {
              localStorage.removeItem('GUEST_TOKEN');
            }
              }
            }
            if (this.isBrowser) {
              localStorage.setItem('isLoggedIn', JSON.stringify(true));
            }
            this.globalFunctionService.getCount();
            this.signalService.userLoggedIn.set(true);

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
            //console.log('error  :', res.error.message);
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
    // //console.log("Form Data:", this.signupForm.value);
  }
  closePopup(action: any = '') {
    if (action == 'deny') {
      // this.activeModal.close({result:null});
      this.activeModal.dismiss();
      this.router.navigate(['/']).then(() => {
        if (this.isBrowser) {
          window.location.reload(); // Reload the page after navigating
        }
      });

      // return;
    } else {
      this.activeModal.close({ result: 'success' });
      //console.log('enter login');
    }

    this.cd.detectChanges();
  }
  loginUser() {
    let isNonUserToken: any = null;
    if (this.isBrowser) {
      isNonUserToken = JSON.parse(localStorage.getItem('GUEST_TOKEN') || 'null');
    }
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
          // //console.log('Response:', res.error.message);
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
            if (this.isBrowser) {
              localStorage.setItem('user', JSON.stringify(res.data));
            }
            this.signalService.user.set(res.data);
            if (this.isBrowser) {
              localStorage.setItem('isLoggedIn', JSON.stringify(true));
            }
            this.globalFunctionService.getCount();
            this.signalService.userLoggedIn.set(true);
            setTimeout(() => {
              this.closePopup();
            }, 0);
          } else if (res.error && res.error.message) {
            //console.log('error  :', res.error.message);
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
          //     //console.log('Dialog closed with:', result);

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
     const redirectUrl = `${environment.API_URL}auth/google/redirect?redirect=/landing`;
      window.location.href = redirectUrl;
      console.log('redirectUrl===>',redirectUrl);
  
    // let endpoint = 'auth/google/redirect?redirect=/landing';
    // this.dataService.get(endpoint).subscribe((res: any) => {
    //   //console.log('res===>', res);
    // });
  }
   loginWithFacebook() {
     const redirectUrl = `${environment.API_URL}auth/facebook/redirect?redirect=/landing`;
  window.location.href = redirectUrl;
    // let endpoint = 'auth/google/redirect?redirect=/landing';
    // this.dataService.get(endpoint).subscribe((res: any) => {
    //   //console.log('res===>', res);
    // });
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
  forgotPaaword() {
    this.isForgotPwd = true;
  }
  initForgotPasswordForm() {
    //     this.forgotPhoneForm = this.fb.group({
    //   phone: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]]
    // })
    this.otpForm = this.fb.group({
      otp: ['', [Validators.required, Validators.minLength(4)]],
    });

    this.forgotEmailForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });

    this.resetPasswordForm = this.fb.group(
      {
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', Validators.required],
      },
      { validators: this.passwordMatch }
    );
  }
  verifyOtp() {
    if (this.otpForm.invalid) return;
    // API CALL: verify OTP
    let payload = {
      email: this.forgotEmailForm.value.email,
      otp: this.otpForm.value.otp,
    };
    this.dataService
      .post(payload, 'auth/verify-forgot-otp')
      .pipe(
        catchError((err) => {
          console.error('Error:', err);
          return of(err);
        })
      )
      .subscribe((res: any) => {
        if (res.success == true) {
          //console.log('Response:', res);
          this.globalService.showMsgSnackBar(res);
          this.forgotStep = 'reset-password';
        } else if (res.success == false) {
          this.globalService.showMsgSnackBar(res);
        }
      });
  }
  passwordMatch(group: FormGroup) {
    return group.get('password')?.value === group.get('confirmPassword')?.value
      ? null
      : { mismatch: true };
  }
  sendResetEmail() {
    if (this.forgotEmailForm.invalid) return;

    // API CALL: send reset email
  }

  goBack() {
    //console.log('this.forgotStep==>',this.forgotStep);

    if (this.forgotStep == 'select') {
      this.isForgotPwd = false;
    }
    if (this.forgotStep == 'phone') {
      this.forgotStep = 'select';
    }
    if (this.forgotStep == 'otp') {
      this.forgotStep = 'phone';
    }
    if (this.forgotStep == 'email') {
      this.forgotStep = 'select';
    }
    if (this.resetPasswordVia == 'otp' && this.forgotStep == 'reset-password') {
      this.forgotStep = 'otp';
    } else if (this.resetPasswordVia == 'email' && this.forgotStep == 'reset-password') {
      this.forgotStep = 'email';
    }
    //   if (this.forgotStep == 'phone') {
    //   this.forgotStep = 'select';
    // }
  }
  resetVia(via: any) {
    this.resetPasswordVia = via;
    this.forgotStep = 'email';
  }
}
