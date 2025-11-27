import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { PageContentFetcher } from 'shared-lib';
import { Header } from './layout/header/header';
import { Footer } from './layout/footer/footer';
import { RazorpayService } from 'shared-lib';
declare var Razorpay: any;
@Component({
  selector: 'safure-root',
  imports: [RouterOutlet, Header, Footer],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})

export class App {
 
  protected readonly title = signal('Safure');

  public razorpayService:any= inject(RazorpayService);
  constructor(){
   // console.info('Environment', environment);
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
