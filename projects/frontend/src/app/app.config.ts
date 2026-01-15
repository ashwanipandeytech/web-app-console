import { ApplicationConfig, provideAppInitializer, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { DataService } from '../../../shared-lib/src/lib/services/data-service';
import { loaderInterceptor } from '../../../shared-lib/src/lib/services/interceptor.service';
import { inject } from '@angular/core';


export const appConfig: ApplicationConfig = {
  providers: [
   
    provideHttpClient(
      withInterceptors([loaderInterceptor])
    ),
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes),
    provideClientHydration(withEventReplay()),
    provideAppInitializer(() => inject(DataService).loadGeneralSettings('settings/general'))
  ]
};





