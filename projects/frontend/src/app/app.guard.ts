import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { Login } from 'shared-lib/components/auth/login/login';

export const authGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const router = inject(Router);
  const ngbModal = inject(NgbModal);

  const token = localStorage.getItem('user'); // your login condition
console.log('token==>',token);
function openLogin() {
  const modalRef: NgbModalRef = ngbModal.open(Login, {
    windowClass: 'mobile-modal login-popup',
    scrollable: true,
    centered: true,
    backdrop: 'static' // optional
  });

  modalRef.result
    .then((result) => {
      console.log('Modal closed with result:', result);
    })
    .catch((reason) => {
      console.log('Modal dismissed:', reason);
    });
}
  const isLoginPage = route.routeConfig?.path === '' || route.routeConfig?.path === 'login';

  // If user is NOT logged in
  if (!token) {
    if (!isLoginPage) {
      // openLogin();
      router.navigate(['/login']);
      return false;
    }
    return true;
  }

  // If user IS logged in
  if (token) {
    console.log('isLoginPage==>',isLoginPage);
    
    if (isLoginPage) {
        console.log('isLoginPage==>',isLoginPage);
        
      router.navigate(['/']);
      return false;
    }
    return true;
  }

  return true;
};
