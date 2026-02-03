import { ChangeDetectorRef, Component, effect, inject, Inject, Input, input, OnInit, PLATFORM_ID } from '@angular/core';
import { productSectionSlideConfig } from '../../constants/app-constant';
import { SlickCarouselModule } from 'ngx-slick-carousel';
import { catchError, of } from 'rxjs';
import { DataService } from '../../services/data-service';
import { Router } from '@angular/router';
import { GlobaCommonlService } from '../../services/global-common.service';
import { GlobalFunctionService } from '../../services/global-function.service';

import { CommonModule, isPlatformBrowser } from '@angular/common';
import { SignalService } from '../../services/signal-service';

@Component({
  selector: 'app-product',
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.scss'],
  imports: [SlickCarouselModule, CommonModule],
})
export class ProductComponent implements OnInit {
  productSectionSlideConfig = productSectionSlideConfig;
  public globalService: any = inject(GlobaCommonlService);
  private globalFunctionService = inject(GlobalFunctionService);
  private signalService = inject(SignalService);
  dataService = inject(DataService);
  cd = inject(ChangeDetectorRef);
  productListData: any = [];
  router = inject(Router);
  @Input() data: any;
  productData: any;
  isWishlisted: boolean = false;
  isLogin: boolean=false;
  isBrowser: boolean;
  private platformId = inject(PLATFORM_ID);
  constructor() {
    this.isBrowser = isPlatformBrowser(this.platformId);
    effect(()=>{

      let isLoggedIn: any = null;
      if (this.isBrowser) {
        isLoggedIn = localStorage.getItem('isLoggedIn');
      }
      //console.log('isLoggedIn==>',isLoggedIn,this.signalService.userLoggedIn());

      if (isLoggedIn == 'true' || this.signalService.userLoggedIn()) {
        this.isLogin = true;
      } else {
        this.isLogin = false;
      }
      this.cd.detectChanges();
      //  }
    });
  }

  ngOnInit() {
    this.callAllProductList();
    // effect(()=>{
    //  this.isLogin = this.signalService.userLoggedIn();
    // })
    // let user = JSON.parse(localStorage.getItem('user') || '{}');
    // if ( typeof user === 'object' && Object.keys(user).length <= 0) {
    //   this.isLogin = false;
    // this.cd.detectChanges();

    // }
    // else{
    //   //console.log('enter isLogin');

    //   this.isLogin = true;
    // this.cd.detectChanges();

    // }
    //console.log('this.data==>',this.data);
    if (this.data) {
      this.productData = this.data;
      // this.cd.detectChanges();
    }
  }

  openProduct(item: any) {

    console.log('openProduct===>',item.product_details.permaLink);
    
   this.router.navigate(
  ['/product-details', item.product_details.permaLink],
  {
    queryParams: { id: item.id }
  }
);
  }
  toggleHeart(item: any) {
    console.info('item', item);
    this.isWishlisted = !this.isWishlisted;
    let data = {
      product_id: item.id,
    };
    if (item.is_wishlisted) {
      item.is_wishlisted = !item.is_wishlisted;
      this.dataService.delete(`wishlist/product/${data.product_id}`).subscribe((res: any) => {
        //console.log('wishlist==>', res);
        this.globalFunctionService.getCount();
        this.cd.detectChanges();
      });
    } else {
      item.is_wishlisted = !item.is_wishlisted;
      this.dataService.post(data, 'wishlist').subscribe((res: any) => {
        //console.log('wishlist==>', res);
        this.globalFunctionService.getCount();
        this.cd.detectChanges();
      });
    }
    this.globalFunctionService.getCount();
    this.cd.detectChanges();
  }
  callAllProductList() {
    this.dataService
      .get('products/search', 'web')
      .pipe(
        catchError((error) => {
          return of(null);
        })
      )
      .subscribe((response: any) => {
        // //console.log('Response:', response);
        this.productListData = response.data.data;
        //console.log('productData==>',this.productListData);

        this.cd.detectChanges();
        if (response && response.success) {
        } else if (response) {
          //add toaserfnc alert('Login failed: ' + response.message);
        }
      });
  }

  addToCart(data: any) {
      let isGuest: any = null;
      if (this.isBrowser) {
        isGuest = JSON.parse(localStorage.getItem('GUEST_TOKEN') || 'null');
      }
      // const guestToken = isGuest;
    let finalData = {
      product_id: data.id,
      quantity: '1',
      guest_token: isGuest,
    };
    // //console.log('finalData==.',finalData);
    // return;
    this.dataService
      .post(finalData, 'cart')
      .pipe(
        catchError((err) => {
          return of(err);
        })
      )
      .subscribe((res: any) => {
        //console.log('Response:', res);
        // //console.log('🧩 x-cart-identifier:', res.headers.get('x-cart-identifier'));
        // if (res.headers) {
        //   let nonLoggedInUserToken = res.headers.get('x-cart-identifier');
        //   //THIS IS TO CHECK WHETHER USER IS GUEST OR NOT
        //   if (nonLoggedInUserToken) {
        //     localStorage.setItem('isNonUser', JSON.stringify(nonLoggedInUserToken));
        //   }
        //   this.globalService.showMsgSnackBar(res.body);
        // }
        if (res.success == true) {
          // console.info('herer add to cart')
          // this.globalFunctionService.getCount();
          this.globalService.showMsgSnackBar(res);
          this.globalFunctionService.getCount();
          this.cd.detectChanges();
        } else if (res.error && res.error.message) {
          this.globalService.showMsgSnackBar(res.error);
        }
        // EMIT THE CART ADDED SIGNAL
      });
  }
}
