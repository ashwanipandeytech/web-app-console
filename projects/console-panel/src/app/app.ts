import { Component, inject, Inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { environment } from '#environments';
import { PageContentFetcher } from 'shared-lib';
import { Router } from '@angular/router';  // Import the Router
import { Sidebar } from './layout/sidebar/sidebar';
import { Header } from './layout/header/header';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'console-root',
  templateUrl: './app.html',
   imports: [Sidebar, Header, ReactiveFormsModule, CommonModule, FormsModule,RouterOutlet],
  styleUrl: './app.scss',
  standalone:true
})
export class App {
  protected readonly title = signal('conceptfit');
  public router=inject(Router)
  isLogin: boolean=false;
  constructor(){

   let userData= localStorage.getItem('user');

   if(userData==null ||userData==undefined|| userData==''){
    //not logged in
    this.isLogin = false;
    console.info('User not logged in');
    this.router.navigate(['login']);
   }else{

 this.isLogin = true;;
   }
   // console.info('Environment', environment);
  }
}
