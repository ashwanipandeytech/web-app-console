import { ChangeDetectorRef, Component, ElementRef, inject, ViewChild } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { catchError, of } from 'rxjs';
import { DataService } from 'shared-lib';
import { environment } from '../../../../../environments/environment';
import { Router, RouterLink } from '@angular/router';
import { CarouselModule } from 'ngx-owl-carousel-o';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { AddAddressModal } from 'shared-lib/model/add-address-modal/add-address-modal';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-landing-page',
  imports: [CarouselModule, RouterLink,CommonModule],
  templateUrl: './landing-page.html',
  styleUrl: './landing-page.scss',
  standalone:true
})
export class LandingPage {
   @ViewChild('addressInput') addressInput!: ElementRef<HTMLInputElement>;
  public dataService:any= inject(DataService);
  readonly ngbModal = inject(NgbModal)
  categoryListData:any;
  productListData: any=[];
  baseURL: string;

  constructor(private cd:ChangeDetectorRef, private router: Router) {
    this.callAllProductList();
    this.getCategoryList();
    this.baseURL=environment.DOMAIN;
  }

  openProduct(id: number) {
    this.router.navigate(['/product-detail', id]);
  }

  // callAllProductList() {
  //   this.dataService.callGetApi('products/search','web').pipe(
  //     catchError((error) => {
  //       // console.error('Error occurred during login:', error);
  //      //add toaserfnc alert('Login failed: ' + response.message);
  //       // Optionally, you can return an observable to prevent further execution
  //       return of(null); // or you can return a default value if needed
  //     })
  //   ).subscribe((response: any) => {
  //     // console.log('Response:', response);
  //   this.productListData = response.data.data;
  //   this.cd.detectChanges();
  //     if (response && response.success) {
      
  //     } else if (response) {
  //      //add toaserfnc alert('Login failed: ' + response.message);
  //     }
  //   });
  // }

  getCategoryList() {
    console.log('environment.API_URL==>', environment);
    this.categoryListData = [];
    this.dataService.callGetApi('categories')
    .pipe(
      catchError(err => {
        console.error('Error:', err);
        return of(null);
      })
    )
    .subscribe((res: any) => {
      console.log('Response:', res);
      if (res.data) {

        for (let i = 0; i < res.data.length; i++) {
          const element = res.data[i];
          console.log('element==>', element.thumbnail);
          if (element?.thumbnail != null) {
           
            element.thumbnail = environment.DOMAIN + '/' + element.thumbnail;
          }
          this.categoryListData.push(element);
        }
      }
      console.log('categoryListData==>', this.categoryListData);

      this.cd.detectChanges();
      // this.categoryListData = res.data;
    });
  }

  getProductDetails() {
    this.router.navigate(['/product-detail']);
  }

  callAllProductList() {

    // const payload = {
    //   email: this.email,
    //   password: this.password
    // };

    
    this.dataService.callGetApi('products/search','web').pipe(
      catchError((error) => {
        return of(null);
      })
    ).subscribe((response: any) => {
    this.productListData = response.data.data;
    console.log('this.productListData==>',this.productListData);
    
    this.cd.detectChanges();
      if (response && response.success) {
      
      } else if (response) {
      }
    });
    
  }

goToCart(){
  this.router.navigate(['/cart']);
}
  //  getCategoryList() {
  //     this.categoryListData = [];
  //     this.dataService.callGetApi('categories')
  //       .pipe(
  //         catchError(err => {
  //           console.error('Error:', err);
  //           return of(null);
  //         })
  //       )
  //       .subscribe((res: any) => {
  //         console.log('Response:', res);
  //         if (res.data) {

  //           for (let i = 0; i < res.data.length; i++) {
  //             const element = res.data[i];
  //             console.log('element==>', element.thumbnail);
  //             if (element?.thumbnail != null) {
  //               console.log('environment.API_URL==>', environment.API_URL);
  //               element.thumbnail = environment.DOMAIN + '/' + element.thumbnail;
  //             }
  //             this.categoryListData.push(element);
  //           }
  //         }
  //         console.log('categoryListData==>', this.categoryListData);

  //         this.cd.detectChanges();
  //         // this.categoryListData = res.data;
  //       });
  //   }
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
