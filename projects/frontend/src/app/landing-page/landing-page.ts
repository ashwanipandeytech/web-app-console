import { HttpClientModule } from '@angular/common/http';
import { ChangeDetectorRef, Component, inject, ViewChild } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { catchError, of } from 'rxjs';
import { DataService } from 'shared-lib';
import { environment } from '../../../../../environments/environment';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { AddAddressModal } from 'shared-lib/model/add-address-modal/add-address-modal';
import { SlickCarouselModule  } from 'ngx-slick-carousel';

declare var $:any;
@Component({
  selector: 'web-landing-page',
  templateUrl: './landing-page.html',
  imports:[SlickCarouselModule,NgOptimizedImage],
  styleUrl: './landing-page.scss',
  standalone:true,
})
export class LandingPage {
  @ViewChild('slickModal') slickModal: any;
  public dataService:any= inject(DataService);
  readonly ngbModal = inject(NgbModal)
  snackBar = inject(MatSnackBar);
  categoryListData:any;
  productListData: any=[];
  baseURL: string;

  slides = [

  {img: '/images/Making-Livestock-Care-Simple-Safe-Effective-7-min.png'},
    {img:'/images/Making-Livestock-Care-Simple-Safe-Effective-16-min.png'},
    // { id: 1, img: 'https://a2zlivestock.com/wp-content/uploads/2025/01/Making-Livestock-Care-Simple-Safe-Effective-7.png' },
    // { id: 2, img: 'https://a2zlivestock.com/wp-content/uploads/2025/01/Making-Livestock-Care-Simple-Safe-Effective-7.png' },



  ];

  slideConfig = {
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 2000,
    dots: true,
    arrows: true,
  };

  heroBannerSlideConfig = {
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 2000,
    dots: true,
    // centerMode: true,
    // centerPadding: '50px',  // MUST have 'px' or '%'
    lazyLoad: 'ondemand',
  };
  
  promoBannerSlideConfig = {
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 2000,
    dots: true,
    // centerMode: true,
    centerPadding: '20px',  // MUST have 'px' or '%'
    lazyLoad: 'ondemand',
    responsive: [
      {
        breakpoint: 540,
        settings: {
          slidesToShow: 1,
          centerPadding: '8px',
          arrows: false,
        }
      }
    ]
  };

  productSectionSlideConfig = {
    slidesToShow: 9,
    // slidesToScroll: 1,
    autoplaySpeed: 2000,
    dots: true,
    // centerMode: true,
    lazyLoad: 'ondemand',
    centerPadding: '12px',
    responsive: [
      {
        breakpoint: 1320,
        settings: {
          centerPadding: '40px',
        }
      },
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 6
        }
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 5
        }
      },
      {
        breakpoint: 540,
        settings: {
          slidesToShow: 3,
          centerPadding: '8px'
        }
      }
    ]
  };

  constructor(private cd:ChangeDetectorRef, private router: Router){
    this.callAllProductList();
    this.baseURL=environment.DOMAIN;
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.slickModal?.initSlick();
    }, 0);
  }

  ngOnInit(){
    this.getCategoryList();
  }

  openProduct(id: number) {
    this.router.navigate(['/product-details', id]);
  }

  callAllProductList() {
    this.dataService.callGetApi('products/search','web').pipe(
      catchError((error) => {
        // console.error('Error occurred during login:', error);
       //add toaserfnc alert('Login failed: ' + response.message);
        // Optionally, you can return an observable to prevent further execution
        return of(null); // or you can return a default value if needed
      })
    ).subscribe((response: any) => {
      // console.log('Response:', response);
    this.productListData = response.data.data;
    this.cd.detectChanges();
      if (response && response.success) {
      
      } else if (response) {
       //add toaserfnc alert('Login failed: ' + response.message);
      }
    });
  }

  getCategoryList() {
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
            console.log('environment.API_URL==>', environment.API_URL);
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

  addToCart(data:any){
    let finalData = {
    "product_id": data.id,
    "quantity": "1"
    }
    console.log('finalData==.',finalData);
    // return;
     this.dataService.callApi(finalData, 'cart')
      .pipe(
        catchError(err => {
          console.error('Error:', err);
            setTimeout(() => {
          this.showSnackbar(err);
        }, 100);
          return of(null);
        })
      )
      .subscribe((res: any) => {
        console.log('Response:', res);

        if (res.success ==true) {   

          this.showSnackbar(res);
}
        })

  }

  showSnackbar(response:any){
    this.snackBar.open(response.message, 'OK', {
      duration: 3000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: [response.success ? 'snackbar-success' : 'snackbar-error']
    });
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