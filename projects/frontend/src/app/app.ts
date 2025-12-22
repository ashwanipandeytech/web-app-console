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
 
  
  }


 


  openCheckout(amount: number) {
   this.razorpayService.openCheckout(amount);
  }
}
