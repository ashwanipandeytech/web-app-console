import { Component, inject, Inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { environment } from '#environments';
import { PageContentFetcher } from 'shared-lib';
import { Router } from '@angular/router';  // Import the Router
@Component({
  selector: 'console-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('conceptfit');
  public router=inject(Router)
  constructor(){

   let userData= localStorage.getItem('user');

   if(userData==null ||userData==undefined|| userData==''){
    //not logged in
    console.info('User not logged in');
    this.router.navigate(['login']);
   }else{


   }
   // console.info('Environment', environment);
  }
}
