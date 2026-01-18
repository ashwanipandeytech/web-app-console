import { HttpClient } from '@angular/common/http';
import { inject, Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { BehaviorSubject, map, Observable } from 'rxjs';
import { AddAddressModal } from '../model/add-address-modal/add-address-modal';
import { DataService } from './data-service';
import { SignalService } from './signal-service';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class GlobalFunctionService {
  private http = inject(HttpClient);
  private signalService = inject(SignalService);
  private cartCountSource = new BehaviorSubject<any>(null);
  cartCount$: Observable<any> = this.cartCountSource.asObservable();
  readonly ngbModal = inject(NgbModal);
  private dataService = inject(DataService);
  countsList: any;
  isBrowser: boolean; // Add this

  constructor(@Inject(PLATFORM_ID) private platformId: Object) { // Inject PLATFORM_ID
    this.isBrowser = isPlatformBrowser(this.platformId); // Initialize isBrowser
  }

  getCountries() {
    return this.http
      .get<any>('https://countriesnow.space/api/v0.1/countries/states')
      .pipe(map((res) => res));
  }

  getCities(country: string, state: string) {
    return this.http
      .post<any>(
        'https://countriesnow.space/api/v0.1/countries/state/cities',
        // `https://countriesnow.space/api/v0.1/countries/${state}/${country}/cities`,
        { country, state }
      )
      .pipe(map((res) => res.data));
  }
  openAddressPopup(data: any = '') {
    const modalRef: NgbModalRef = this.ngbModal.open(AddAddressModal, {
      windowClass: 'mobile-modal',
      scrollable: true,
      centered: true,
    });
    modalRef.componentInstance.data = data;
    return modalRef.result;
    // modalRef.result.then((result) => {
    //   //console.log('Modal closed with result:', result);
    //   return result;
    // }).catch((reason) => {
    //   //console.log('Modal dismissed:', reason);
    //   return reason;

    // });
  }
  getCount() {
    let isGuest: any = null;
    if (this.isBrowser) {
      isGuest = JSON.parse(localStorage.getItem('GUEST_TOKEN') || 'null');
    }
    const guestToken = isGuest;
    this.dataService.get(`user/overview-counts`).subscribe((res: any) => {
      this.countsList = res.data;
      //console.log('res.data', res.data);

      this.signalService.setCounts(res.data);
    });
  }
  // setCartCount(data: any) {
  //     this.cartCountSource.next(data);
  //   }
}
