import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { SignalService } from './signal-service';
import { finalize } from 'rxjs';

export const loaderInterceptor: HttpInterceptorFn = (req, next) => {
  const signalService = inject(SignalService);

  // List of endpoints that should NOT trigger the loader
  const excludedEndpoints = [
    'settings/general',
    'countries/states',
    'user/overview-counts',
    'products/search',
    'setting.component.json',
    
  ];

  // Check if the current request URL matches any excluded endpoint
  const isExcluded = excludedEndpoints.some(url => req.url.includes(url));

  if (isExcluded) {
    return next(req);
  }
  
  signalService.show();

  return next(req).pipe(
    finalize(() => {
    
      signalService.hide();
    })
  );
};