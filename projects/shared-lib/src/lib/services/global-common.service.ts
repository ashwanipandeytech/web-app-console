import { inject, Injectable, signal } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root',
})
export class GlobaCommonlService {
  toastr = inject(ToastrService);

  constructor() {}

  showToast(response: any) {
    if (response.success) {
      this.toastr.success(response.message);
    } else {
      this.toastr.error(response.message || 'Something went wrong');
    }
  }

  calculatePrice(quantity: any, index: any, price: any, cartData: any) {
    let productQuantity: any = null;
    let regularPrice = null;
    productQuantity = quantity;
    regularPrice = price;
    //// console.log('quantity==>',quantity);
    //// console.log('price==>',price);

    cartData[index].product.price_data.finalPrice = quantity * regularPrice;
    this.calculateGrandTotal(cartData);
    // this.selectedProduct.price_data.regularPrice = this.productPrice * this.quantity;
    // this.cd.detectChanges();
  }
  calculateGrandTotal(cartListData: any) {
   //// console.log('this.cartListData==>',cartListData);

    // this.grandTotal = 0;
    let grandTotal = 0;

    for (let i = 0; i < cartListData.length; i++) {
      const element = cartListData[i];
      grandTotal += element.product.price_data.finalPrice;
    }
    // this.loading = false;
    return grandTotal;
    // //// console.log('this.grandTotal==>',this.grandTotal);
  }
}
