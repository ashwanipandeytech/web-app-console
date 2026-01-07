import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';


import { Header } from 'shared-lib/components/layout/header/header';
import { Footer } from 'shared-lib/components/layout/footer/footer';
import { RazorpayService } from 'shared-lib';
import { PlatformDetectionService } from 'shared-lib';
import { DataService } from 'shared-lib';
import { catchError, of } from 'rxjs';
declare var Razorpay: any;
@Component({
  selector: 'safure-root',
  imports: [RouterOutlet, Header, Footer],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './app.html',
  styleUrl: './app.scss'
})

export class App {
 
  protected readonly title = signal('Safure');
  protected readonly platFormType:string;
  public dataService: any = inject(DataService);
  public razorpayService:any= inject(RazorpayService);
  public platformDetectionService:any= inject(PlatformDetectionService);
  constructor(){
   this.platFormType= this.platformDetectionService.getActivePlatform()
      let user = localStorage.getItem('user');
      let guestToken = localStorage.getItem('GUEST_TOKEN');
      if (user == null && !guestToken) {
         this.dataService
               .post('','guest/init')
               .pipe(
                 catchError((err) => {
                   console.error('Error:', err);
                   return of(err);
                 })
               )
               .subscribe((res: any) => {
                 console.log('Response:', res);
                 if (res.success == true) {
                  localStorage.setItem('GUEST_TOKEN', JSON.stringify(res.data.guest_token));
                 }
               });
      }
  }


 


  openCheckout(amount: number) {
   this.razorpayService.openCheckout(amount);
  }
}
