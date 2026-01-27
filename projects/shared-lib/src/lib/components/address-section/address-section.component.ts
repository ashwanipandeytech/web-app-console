import { ChangeDetectorRef, Component, effect, ElementRef, inject, Inject, OnInit, PLATFORM_ID, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { catchError, of } from 'rxjs';
import { DataService } from '../../services/data-service';
import { GlobalFunctionService } from '../../services/global-function.service';
import { GlobaCommonlService } from '../../services/global-common.service';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { NoDataComponent } from '../no-data/no-data.component';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { AddAddressModal } from '../../model/add-address-modal/add-address-modal';
declare var bootstrap: any;
import { SignalService } from '../../services/signal-service';
@Component({
  selector: 'app-address-section',
  templateUrl: './address-section.component.html',
  imports: [FormsModule, CommonModule, NoDataComponent],
  styleUrls: ['./address-section.component.scss']
})
export class AddressSectionComponent implements OnInit {
  @ViewChild('removeAddressModal') removeAddressModal!: ElementRef;
  data: any;
  addressListData: any = [];
  private dataService = inject(DataService);
  public globalFunctionService = inject(GlobalFunctionService);
  private globalService = inject(GlobaCommonlService);
  private signalService = inject(SignalService);

  private cd = inject(ChangeDetectorRef);
  readonly ngbModal = inject(NgbModal);

  currentUser: any;
  deleteAddressId: any;
  isLoggedIn:boolean=true
  isLoading: boolean = true;
  isBrowser: boolean;
  private platformId = inject(PLATFORM_ID);
  constructor() {
    this.isBrowser = isPlatformBrowser(this.platformId);

    //console.log('data==>',this.data);
    effect(() => {
      if (this.signalService.userLoggedIn()) {
        if (this.isBrowser) {
           this.isLoggedIn =true;
          this.currentUser = JSON.parse(localStorage.getItem('user') || 'null');
        }
        this.getAddressList();
        
        this.cd.detectChanges();
      }

    });

  }
  openAddressPopup() {
    this.globalFunctionService.openAddressPopup().then((res: any) => {
      console.info('res', res)
      if (res.result == 'success') {
        this.getAddressList();
        //this.cd.detectChanges();
      }
      //console.log('==>',res);
    })

  }
  ngOnInit() {
    if (this.isBrowser) {
      this.isLoggedIn = JSON.parse(localStorage.getItem('isLoggedIn') || 'null');

      if (!this.isLoggedIn ) {
        this.addressListData = []
        this.signalService.openLoginPopup.set(true)
        return;

      }
      this.getAddressList();
      this.currentUser = JSON.parse(localStorage.getItem('user') || 'null');
    }
  }

  getAddressList(isLoading: boolean = true) {
    this.isLoading = isLoading;
    this.dataService.get('addresses').pipe(
      catchError((error) => {
        return of(null);
      })
    ).subscribe((response: any) => {
      if (response.success == true) {
        this.addressListData = response.data;
        console.log('this.addressListData==>', this.addressListData);
        this.isLoading = false;
        this.cd.detectChanges();
      }
    })
  }
  setDeleteId(id: any) {
    this.deleteAddressId = id;
  }
  deleteAddress() {
    //console.log('Deleting ID:', this.deleteAddressId);

    this.dataService.delete(`addresses/${this.deleteAddressId}`).subscribe((res: any) => {
      // uncomment below 
      // if (res.success) {
      // this.globalService.showMsgSnackBar(res);
      this.getAddressList();
      if (this.isBrowser) {
        const modal = bootstrap.Modal.getInstance(
          this.removeAddressModal.nativeElement
        );
        modal.hide();
      }
      // }

    });
  }

  editAddress(item: any) {
    const modalRef: NgbModalRef = this.ngbModal.open(AddAddressModal, {
      windowClass: 'mobile-modal',
      scrollable: true,
      centered: true,
    });
    modalRef.componentInstance.data = item;
    modalRef.result.then((res) => {
      // console.log('result===>',res);
      if (res.result === 'success') {
        this.getAddressList();
        this.cd.detectChanges();
      }

      //console.log('Modal closed with result:', result);
      // return res;
    }).catch((reason) => {
      //console.log('Modal dismissed:', reason);
      return reason;

    });
    // return modalRef.result;
  }
}
