import { ChangeDetectorRef, Component, inject, Input, input, OnInit } from '@angular/core';
import { productSectionSlideConfig } from 'shared-lib/constants/app-constant';
import { SlickCarouselModule } from 'ngx-slick-carousel';
import { catchError, of } from 'rxjs';
import { DataService } from '../../services/data-service';
import { Router } from '@angular/router';
import { GlobaCommonlService } from '../../../../../global-common.service';
import { GlobalFunctionService } from 'shared-lib/services/global-function.service';

import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-product',
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.scss'],
  imports: [SlickCarouselModule,CommonModule],
})
export class ProductComponent implements OnInit {
  productSectionSlideConfig = productSectionSlideConfig;
  public globalService:any= inject(GlobaCommonlService);
  private globalFunctionService = inject(GlobalFunctionService);
  dataService = inject(DataService);
  cd = inject(ChangeDetectorRef);
  productListData: any = [];
  router = inject(Router);
  @Input () data:any
  productData: any;
  isWishlisted: boolean=false;
  constructor() {}

  ngOnInit() {
    this.callAllProductList();
    this.productData = this.data;
    this.cd.detectChanges();
  }

  openProduct(id: number) {
    this.router.navigate(['/product-details', id]);
  }
toggleHeart(id:any) {
   this.isWishlisted = !this.isWishlisted;
    let data = {
      product_id:id
    }
    if (this.isWishlisted) {
      this.dataService.post(data,'wishlist').subscribe((res:any)=>{
        console.log('wishlist==>',res);
      })
    }
    else{
         this.dataService.delete('wishlist/product',data.product_id).subscribe((res:any)=>{
        console.log('wishlist==>',res);
      })
    }
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
        // console.log('Response:', response);
        this.productListData = response.data.data;
        this.cd.detectChanges();
        if (response && response.success) {
        } else if (response) {
          //add toaserfnc alert('Login failed: ' + response.message);
        }
      });
  }

  addToCart(data: any) {
    let finalData = {
      product_id: data.id,
      quantity: '1',
    };
    // console.log('finalData==.',finalData);
    // return;
    this.dataService
      .post(finalData, 'cart')
      .pipe(
        catchError((err) => {
          return of(err);
        })
      )
      .subscribe((res: any) => {
        console.log('Response:', res);
        // console.log('🧩 x-cart-identifier:', res.headers.get('x-cart-identifier'));
        if (res.headers) {
          let nonLoggedInUserToken = res.headers.get('x-cart-identifier');
          //THIS IS TO CHECK WHETHER USER IS GUEST OR NOT
          if (nonLoggedInUserToken) {
            localStorage.setItem('isNonUser', JSON.stringify(nonLoggedInUserToken));
          }
            this.globalService.showMsgSnackBar(res.body);
        }
        if (res.success == true) {
          this.globalService.showMsgSnackBar(res);
          this.globalFunctionService.getCount();
        } else if (res.error && res.error.message) {
          this.globalService.showMsgSnackBar(res.error);
        }
        // EMIT THE CART ADDED SIGNAL 
      });
  }
}
