import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';
import { Capacitor } from '@capacitor/core';
import { isPlatformBrowser } from '@angular/common';

interface PlatformInfo {
  App: boolean;
  ios: boolean;
  andriod: boolean;
  mobileWeb: boolean;
  Web: boolean;
  Desktop: boolean;
  ipad: boolean;
  tab: boolean;
  tabWeb: boolean;
}


@Injectable({
  providedIn: 'root'
})

export class PlatformDetectionService {
  isBrowser: boolean;

  constructor(private http: HttpClient, @Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  
  checkPlatformType(): PlatformInfo{
    const platformValue:PlatformInfo = {
      App: false,
      ios: false,
      andriod: false,
      mobileWeb: false,
      Web: false,
      Desktop: false,
      ipad: false,
      tab: false,
      tabWeb: false
    }
    // Capacitor Platform & NativePlatform detection , 

    let platformName: string = 'web';
    let userAgent: string = '';
    let screenMin: number = 0;
    let screenMax: number = 0;
    let screenWidth: number = 0;

    if (this.isBrowser) {
      platformName = Capacitor.getPlatform(); // 'ios' | 'android' | 'web'
      platformValue.App = Capacitor.isNativePlatform();
      userAgent = navigator.userAgent.toLowerCase();
      screenMin = Math.min(window.screen.width, window.screen.height);
      screenMax = Math.max(window.screen.width, window.screen.height);
      screenWidth = typeof window !== 'undefined' ? window.innerWidth : 0;

      platformValue.Desktop = !!(window as any)['isOffline'];
    }

    // If Desktop is true, then return all values as false except Desktop
    if (platformValue.Desktop) {
      return platformValue;
    }

    // Modern iPad detection (iOS 13+ reports as Mac sometimes)
    const isIPad = this.isBrowser && platformName === 'ios' && platformValue.App && screenMin >= 768 && (/ipad/.test(userAgent) || ('maxTouchPoints' in navigator && navigator.maxTouchPoints > 1 && /macintosh|mac os/i.test(userAgent)));
    if(isIPad){
      platformValue.ipad = true;
      return platformValue;
    }

    // Android tablet detection using screen size (min width ≥ 768px)
    if(platformName == 'andriod' && platformValue.App &&  screenMin >= 768){
      platformValue.tab = true;
      return platformValue;
    }

    // Check for Tab Browser
    const isTabletBrowser = this.isBrowser && platformName == 'web' && !platformValue.App && screenMin >= 768 && screenMax <= 1366 && (/ipad|tablet|kindle|playbook|silk/.test(userAgent) || (this.isBrowser && navigator.maxTouchPoints && navigator.maxTouchPoints > 1 && /android/.test(userAgent)));
    if(isTabletBrowser){
      platformValue.tabWeb = true;
      return platformValue;
    }

    // Check for Mobile Browser
    if(this.isBrowser && platformName === 'web' && !platformValue.App && screenWidth <= 767){
      platformValue.mobileWeb = true;
      return platformValue;
    }
    
    // General Desktop Web
    if(this.isBrowser && platformName === 'web' && !platformValue.App){
      platformValue.Web = true;
      return platformValue;
    }

    // Detect Native Android/iOS
    if(this.isBrowser && platformValue.App){
      if(platformName === 'android'){
        platformValue.andriod = true;
      }else if(platformName === 'ios'){
        platformValue.ios = true;
      }
    }

    // Return the all Result
    return platformValue;
  }
  

  getActivePlatform(){
  
      let deviceType:any = this.checkPlatformType();
      if (deviceType) {   
        const filtered = Object.fromEntries(
             Object.entries(deviceType).filter(([key, value]) => value === true)
             );
             const platformName = Object.keys(filtered)[0];
             return platformName;
      }
      return false
    
  }
  

}