import { HttpClient, HttpClientModule } from '@angular/common/http';
import { ChangeDetectorRef, Component, inject, ViewChild } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { catchError, of } from 'rxjs';
import { DataService } from 'shared-lib';
import { environment } from '../../environments/environment';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { AddAddressModal } from 'shared-lib/model/add-address-modal/add-address-modal';
import { SlickCarouselModule  } from 'ngx-slick-carousel';
import { GlobaCommonlService } from '../../services/global-common.service';
import { HostOutletComponent } from '../host-outlet/host.component';

declare var $:any;
@Component({
  selector: 'web-landing-page',
  templateUrl: './landing-page.html',
  imports:[SlickCarouselModule,HostOutletComponent],
  styleUrl: './landing-page.scss',
  standalone:true,
})
export class LandingPage {
  @ViewChild('slickModal') slickModal: any;
  public dataService:any= inject(DataService);
  // public globalService:any= inject(GlobaCommonlService);
  readonly ngbModal = inject(NgbModal)
  categoryListData:any;
  productListData: any=[];
  baseURL: string;
  constructor(private cd:ChangeDetectorRef, private router: Router,private http:HttpClient){
    this.baseURL=environment.DOMAIN;
  }

  ngAfterViewInit() {

  }

  ngOnInit(){
    // this.getCategoryList();
  }

  openProduct(id: number) {
    this.router.navigate(['/product-details', id]);
  }




  openAddressPopup(){
    const modalRef: NgbModalRef = this.ngbModal.open( AddAddressModal,
    { windowClass:'mobile-modal',
      scrollable: true
    });
    modalRef.result.then((result) => {
      console.log('Modal closed with result:', result);
    }).catch((reason) => {
      console.log('Modal dismissed:', reason);
    });
  }
}

