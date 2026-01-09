import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';

export const authGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const router = inject(Router);
  const token = localStorage.getItem('user'); // your login condition
//console.log('token==>',token);

  const isLoginPage = route.routeConfig?.path === '' || route.routeConfig?.path === 'login';

  // If user is NOT logged in
  if (!token) {
    if (!isLoginPage) {
      router.navigate(['/login']);
      return false;
    }
    return true;
  }

  // If user IS logged in
  if (token) {
    if (isLoginPage) {
      router.navigate(['/dashboard']);
      return false;
    }
    return true;
  }

  return true;
};
