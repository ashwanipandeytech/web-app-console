import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';


import { Header } from './layout/header/header';
import { Footer } from './layout/footer/footer';
import { RazorpayService } from 'shared-lib';
import { PlatformDetectionService } from 'shared-lib';
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

  public razorpayService:any= inject(RazorpayService);
  public platformDetectionService:any= inject(PlatformDetectionService);
  constructor(){
   this.platFormType= this.platformDetectionService.getActivePlatform()
   console.info('this.platFormType',this.platFormType)
  
  }


  // payNow() {
  //   const amount = 500; // in rupees

  //   this.razorpayService.createOrder(amount).subscribe({
  //     next: (order:any) => {
  //       this.razorpayService.openCheckout(order, {
  //         prefill: {
  //           name: 'Rahul Kumar',
  //           email: 'rahul@example.com',
  //           contact: '9876543210'
  //         }
  //       });
  //     },
  //     error: (err:any) => {
  //       console.error(err);
  //       alert('Failed to create order');
  //     }
  //   });
  // }


  openCheckout(amount: number) {
   this.razorpayService.openCheckout(amount);
  }
}
