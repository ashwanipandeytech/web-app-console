import { Component, signal } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { environment } from '#environments';
import { PageContentFetcher } from 'shared-lib';
import { Header } from './header/header';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'conceptfit-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
  imports: [CommonModule, RouterOutlet, Header]
})
export class App {
  protected readonly title = signal('conceptfit');
  
  isHomeScreenOpen: Boolean = true;

  constructor(private router: Router){
    console.info('Environment', environment);
  }

  openSignUp() {
    this.isHomeScreenOpen=false;
    this.router.navigate(['/login']);
  }
}
