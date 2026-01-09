import { ChangeDetectorRef, Component, ElementRef, inject, ViewChild } from '@angular/core';
import { DataService } from '../../../services/data-service';
import { GlobaCommonlService } from '../../../services/global-common.service';
import { catchError, of } from 'rxjs';
import { GlobalFunctionService } from '../../../services/global-function.service';
import { NoDataComponent } from '../../no-data/no-data.component';
import { CommonModule } from '@angular/common';
declare var bootstrap: any;

@Component({
  selector: 'web-wishlist',
  imports: [NoDataComponent,CommonModule],
  templateUrl: './wishlist.html',
  styleUrl: './wishlist.scss'
})
export class Wishlist {
  @ViewChild('removeProduct') removeProduct!: ElementRef;
  public dataService:any = inject(DataService);
  public globalFunctionService:any = inject(GlobalFunctionService);
  public globalCommonService:any = inject(GlobaCommonlService)
  public cd = inject(ChangeDetectorRef);
  wishListData: any=[];
  WishListId: any;
  isLoading: boolean=true;
ngOnInit(){
 this.getWishlistData();
}


getWishlistData(){
  this.isLoading = true;
  this.dataService.get('wishlist').subscribe((res:any)=>{
  this.wishListData = res.data;
  this.isLoading = false;

  this.cd.markForCheck();
  })
}
removeWishlist(id:any){
this.WishListId = id;
}
remove(){
  this.dataService.delete(`wishlist/${this.WishListId}`).subscribe((res:any)=>{
    let response = {
        message:'Item Removed from Wish List',
        success:true
    }
     const modal = bootstrap.Modal.getInstance(
        this.removeProduct.nativeElement
      );
      modal.hide();
  this.globalCommonService.showMsgSnackBar(response);
  this.getWishlistData();
  this.cd.markForCheck();
  })
}
 addToCart(data: any) {
      let isGuest: any = JSON.parse(localStorage.getItem('GUEST_TOKEN') || 'null');

    let finalData = {
      product_id: data.id,
      quantity: '1',
      guest_token:isGuest
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
        if (res.headers) {
          let nonLoggedInUserToken = res.headers.get('x-cart-identifier');
          //THIS IS TO CHECK WHETHER USER IS GUEST OR NOT
          if (nonLoggedInUserToken) {
            localStorage.setItem('isNonUser', JSON.stringify(nonLoggedInUserToken));
          }
          this.globalCommonService.showMsgSnackBar(res.body);
        }
        if (res.success == true) {
          this.globalCommonService.showMsgSnackBar(res);
          this.globalFunctionService.getCount();
        } else if (res.error && res.error.message) {
          this.globalCommonService.showMsgSnackBar(res.error);
        }
        // EMIT THE CART ADDED SIGNAL
      });
  }
}
