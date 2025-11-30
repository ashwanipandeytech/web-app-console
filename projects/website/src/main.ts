import { provideZoneChangeDetection } from "@angular/core";
import { bootstrapApplication } from '@angular/platform-browser';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { appConfig } from './app/app.config';
import { App } from './app/app';

bootstrapApplication(App, {
  ...appConfig,
  providers: [
    provideZoneChangeDetection(),...(appConfig.providers ?? []),
    provideAnimationsAsync(),   // ✅ Correct for Angular 17–20
  ],
}).catch((err) => console.error(err));
