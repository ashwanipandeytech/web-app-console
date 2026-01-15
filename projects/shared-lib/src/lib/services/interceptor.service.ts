import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { SignalService } from './signal-service';
import { finalize } from 'rxjs';

export const loaderInterceptor: HttpInterceptorFn = (req, next) => {
  const signalService = inject(SignalService);
  
  signalService.show();

  return next(req).pipe(
    finalize(() => {
    
      signalService.hide();
    })
  );
};