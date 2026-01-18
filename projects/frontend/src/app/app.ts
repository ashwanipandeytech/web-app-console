import { ChangeDetectionStrategy, Component, inject, signal, Inject, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';
import { isPlatformBrowser } from '@angular/common'; // Add this
import { Header } from 'shared-lib/components/layout/header/header';
import { Footer } from 'shared-lib/components/layout/footer/footer';
import { RazorpayService } from 'shared-lib';
import { PlatformDetectionService } from 'shared-lib';

import { SignalService } from 'shared-lib';
import { DataService } from 'shared-lib';
import { catchError, of } from 'rxjs';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { Login } from 'shared-lib/components/auth/login/login';
import { GlobaCommonlService } from '../../../shared-lib/src/lib/services/global-common.service';

import { GlobalFunctionService } from '../../../shared-lib/src/lib/services/global-function.service';

declare var Razorpay: any;
@Component({
  selector: 'safure-root',
  imports: [RouterOutlet, Header, Footer],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './app.html',
  styleUrl: './app.scss'
})

export class App {
  readonly ngbModal = inject(NgbModal);
  protected readonly title = signal('Safure');
  protected readonly platFormType: string;
  public dataService: any = inject(DataService);
  public globalService: any = inject(GlobaCommonlService);
  public globalFunctionService = inject(GlobalFunctionService);
  public razorpayService: any = inject(RazorpayService);
  public signalService: any = inject(SignalService)
  public platformDetectionService: any = inject(PlatformDetectionService);
  isBrowser: boolean; // Add this
  private platformId = inject(PLATFORM_ID);
  constructor(private router: Router,
    private activatedRoute: ActivatedRoute,
    private cd: ChangeDetectorRef
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId); // Initialize isBrowser
    this.platFormType = this.platformDetectionService.getActivePlatform()
    let user = null;
    let guestToken = null;
    if (this.isBrowser) {
      user = localStorage.getItem('user');
      guestToken = localStorage.getItem('GUEST_TOKEN');
    }
    if (user == null && !guestToken) {
      this.dataService
        .post('', 'guest/init')
        .pipe(
          catchError((err) => {
            console.error('Error:', err);
            return of(err);
          })
        )
        .subscribe((res: any) => {
          //console.log('Response:', res);
          if (res.success == true) {
            if (this.isBrowser) { // Guard this localStorage.setItem
              localStorage.setItem('GUEST_TOKEN', JSON.stringify(res.data.guest_token));
            }
          }
        });
    }
  }


  ngAfterViewInit(): void {


    this.activatedRoute.queryParams.subscribe(params => {



      if (this.router.url.includes('reset-password') && params['token']) {
        let resetToken = params['token'];
        let resetEmail = params['email'];

        let forgotStep = 'reset-password';

        setTimeout(() => {
          this.openForgotPopup(resetToken, resetEmail, forgotStep);
        }, 0);
      }
      //console.info('this.router.url', this.router?.url.split('?')[0] === '/', params['key'])
      if (this.router?.url.split('?')[0] === '/' && params['key']) {
        let payLoad = {
          'X-Social-Login-Key': params['key']
        }
        this.dataService.post(payLoad, 'social/consume')
          .pipe(
            catchError(err => {
              console.error('Error:', err);

              return of(err);
            })
          )
          .subscribe((res: any) => {

            if (res.success == true) {
              console.info('data', res)
              this.globalService.showMsgSnackBar(res);

              localStorage.removeItem("GUEST_TOKEN");

              // }
              //make a signal for emiting the user state
              if (this.isBrowser) {
                let data={
                  token:res.token,
                  user:res.user
                }
                localStorage.setItem("user", JSON.stringify(res.data));
              }
              this.signalService.user.set(res.data);
              if (this.isBrowser) {
                localStorage.setItem("isLoggedIn", JSON.stringify(true));
              }
              this.globalFunctionService.getCount();
              this.signalService.userLoggedIn.set(true);
              
               this.router.navigate([], {
          queryParams: { key: null },
          queryParamsHandling: 'merge',
          replaceUrl: true
        });

              this.cd.detectChanges();




              // this.globalFunctionService.getCount();
            }






            if (res.success == true) {

            }
          });
      }
    });
  }

  openForgotPopup(token: any, email: any, step: any) {
    let data = {
      token: token,
      email: email,
      step: step
    }
    const modalRef: NgbModalRef = this.ngbModal.open(Login, {
      windowClass: 'mobile-modal login-popup',
      scrollable: true,
      centered: true
    });
    modalRef.componentInstance.loginData = data;
    this.router.navigate(['']);
    modalRef.result
      .then((result) => {
        //console.log('Modal closed with result:', result);
      })
      .catch((reason) => {
        //console.log('Modal dismissed:', reason);
      });
  }
  openCheckout(amount: number) {
    this.razorpayService.openCheckout(amount);
  }
}
