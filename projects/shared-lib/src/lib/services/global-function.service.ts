import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { map } from 'rxjs';
import { AddAddressModal } from '../model/add-address-modal/add-address-modal';

@Injectable({
  providedIn: 'root'
})
export class GlobalFunctionService {
private http = inject(HttpClient);
 readonly ngbModal = inject(NgbModal)
constructor() { }

 getCountries() {
  return this.http.get<any>(
    'https://countriesnow.space/api/v0.1/countries/states'
  ).pipe(
    map((res) => res)
  );
}

getCities(country: string, state: string) {
    return this.http.post<any>(
       'https://countriesnow.space/api/v0.1/countries/state/cities',
      // `https://countriesnow.space/api/v0.1/countries/${state}/${country}/cities`,
      { country, state }
    ).pipe(
      map(res => res.data)
    );
  }
   openAddressPopup(data:any=''){
    const modalRef: NgbModalRef = this.ngbModal.open( AddAddressModal,
    { windowClass:'mobile-modal',
      scrollable: true
    });
    modalRef.componentInstance.data = data;
    modalRef.result.then((result) => {
      console.log('Modal closed with result:', result);
    }).catch((reason) => {
      console.log('Modal dismissed:', reason);
    });
  }
}
