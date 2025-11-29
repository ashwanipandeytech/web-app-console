import { Component, signal } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { environment } from '#environments';
import { PageContentFetcher } from 'shared-lib';
import { Header } from './header/header';
import { CommonModule } from '@angular/common';
import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';
import { StatusBar, Style } from '@capacitor/status-bar';
import { EdgeToEdge } from '@capawesome/capacitor-android-edge-to-edge-support';
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
    if (Capacitor.isNativePlatform()) {
      this.initializeApp();
    }
  }
  initializeApp() {
    this.addAppListeners();
    this.configureStatusbar();
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
  async configureStatusbar() {
    await StatusBar.setOverlaysWebView({ overlay: false });
    await EdgeToEdge.setBackgroundColor({ color: '#000000' });
    // await StatusBar.setStyle({ style: Style.Dark });
    // await StatusBar.getInfo().then(info => {
    //   console.log('Status Bar Info : ', info);
    // })
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
