import { isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Capacitor } from '@capacitor/core';

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

// For prevention of Invalid Payloads, we are using enum
// This will help us to avoid typos and ensure that only valid platform payloads are used
export enum PlatformPayload {
  DesktopMac = 'DesktopApp-Mac',
  DesktopWin = 'DesktopApp-Win',
  DesktopLin = 'DesktopApp-Lin',
  TabIOS = 'Tab-iOS',
  TabAndroid = 'Tab-Android',
  WebTab = 'Web-Tab',
  WebMobile = 'Web-Mobile',
  WebDesktop = 'Web-Desktop',
  MobileAndroid = 'Mobile-Android',
  MobileIOS = 'Mobile-iOS'
}

export type PlatformInfoForPayload = keyof typeof PlatformPayload;


@Injectable({
  providedIn: 'root'
})
export class CheckPlatformService {
  isBrowser: boolean; // Add this

  constructor(private activeRoute:ActivatedRoute, @Inject(PLATFORM_ID) private platformId: Object) { // Inject PLATFORM_ID
    this.isBrowser = isPlatformBrowser(this.platformId); // Initialize isBrowser
  }

  // NOTE: Below function is Final to detect every platform type, if needed to add more platform types, then add it in PlatformInfo interface and PlatformPayload enum
  checkPlatformType(){
    const platformValue = {
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


getActivePlatform() {
  const deviceType: any = this.checkPlatformType();

  if (deviceType) {
    const filtered = Object.fromEntries(
      Object.entries(deviceType).filter(([_, value]) => value === true)
    );

    const platformName = Object.keys(filtered)[0];

    return platformName || 'unknown';
  }

  return 'unknown'; // default return
}


//   getPlatformForPayload() {
//     let platform:any;
//        platform = this.checkPlatformType();
//        const userAgent = navigator.userAgent.toLowerCase();
//        if (platform?.Desktop) {
//          if (userAgent.includes('macintosh') || userAgent.includes('mac os')) {
//            return PlatformPayload.DesktopMac;
//          } else if (userAgent.includes('windows')) {
//            return PlatformPayload.DesktopWin;
//          } else if (userAgent.includes('linux')) {
//            return PlatformPayload.DesktopLin;
//          }
//        }

//     else if (platform.ipad) {
//       return PlatformPayload.TabIOS;
//     }
//     else if (platform.tab) {
//       return PlatformPayload.TabAndroid;
//     }
//     else if (platform.tabWeb) {
//       return PlatformPayload.WebTab;
//     }
//     else if (platform.mobileWeb) {
//       return PlatformPayload.WebMobile;
//     }
//     else if (platform.Web) {
//       return PlatformPayload.WebDesktop;
//     }
//     else if (platform.andriod) {
//       return PlatformPayload.MobileAndroid;
//     }
//     else if (platform.ios) {
//       return PlatformPayload.MobileIOS;
//     }
//   }
//   getSavedEditorVersion(){
//     const editorVersion = this.activeRoute.snapshot.queryParams['editorVersion'];
//     return editorVersion+'_'+this.checkPlatformType()
//   }
}