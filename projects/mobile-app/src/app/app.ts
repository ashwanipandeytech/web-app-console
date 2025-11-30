import { Component, signal } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { environment } from '#environments';
import { PageContentFetcher } from 'shared-lib';
import { Header } from './header/header';
import { CommonModule } from '@angular/common';
import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';

@Component({
  selector: 'conceptfit-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
  imports: [CommonModule, RouterOutlet, Header]
})
export class AppComponent {
  protected readonly title = signal('conceptfit');

  isHomeScreenOpen: Boolean = true;
  previousUrl: any;
  currentUrl: any;

  constructor(private router: Router) {
    router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.previousUrl = this.currentUrl;
        this.currentUrl = event.url;
      };
    });
  
   //alert(Capacitor.isNativePlatform())
    if (Capacitor.isNativePlatform()) {
      this.initializeApp();
    }
  }
  initializeApp() {
    this.addAppListeners();
  
  }
  addAppListeners() {
    try {
      App.addListener('backButton', BackButtonListener => {
        // console.log('Clicked Back Button : ', BackButtonListener);
        const currentPath = this.router.url;
        if (currentPath === '/') {
          App.exitApp();
        } else if (BackButtonListener.canGoBack) {
          this.router.navigateByUrl(this.previousUrl);
        } else {
          this.router.navigate(['..']);
        }
      });

      App.addListener('appUrlOpen', () => {
        // console.log('App URL Opened After editor closed');
      })
    } catch {
      // console.log('Error in App Listener');
    }
  }

  

  openSignUp() {
    this.isHomeScreenOpen = false;
    this.router.navigate(['/login']);
  }
  goToHome() {
    this.isHomeScreenOpen = false;
    this.router.navigate(['/home']);
  }
}
