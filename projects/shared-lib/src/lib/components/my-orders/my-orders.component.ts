import { CommonModule, isPlatformBrowser } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  effect,
  ElementRef,
  inject,
  OnInit,
  ViewChild,
  Inject, // Add Inject
  PLATFORM_ID, // Add PLATFORM_ID
  QueryList,
  ViewChildren
} from '@angular/core';
import { catchError, of } from 'rxjs';
import { GlobaCommonlService } from '../../services/global-common.service';
import { DataService } from '../../services/data-service';
import { NoDataComponent } from '../no-data/no-data.component';
import { GlobalFunctionService } from '../../services/global-function.service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { SignalService } from '../../services/signal-service';
declare var bootstrap: any;

@Component({
  selector: 'app-my-orders',
  templateUrl: './my-orders.component.html',
  imports: [CommonModule, NoDataComponent, ReactiveFormsModule],
  styleUrls: ['./my-orders.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MyOrdersComponent implements OnInit {
  @ViewChild('orderDetail') orderDetail!: ElementRef;
  @ViewChild('rateusModal') rateusModal!: ElementRef;
//  @ViewChild('collapseProduct') collapseProduct!: ElementRef;
@ViewChildren('collapseRef') collapseRefs!: QueryList<ElementRef>;
  dataService = inject(DataService);
  private cd = inject(ChangeDetectorRef);
  public globalService: any = inject(GlobaCommonlService);
  private globalFunctionService = inject(GlobalFunctionService);
  private signalService = inject(SignalService);
  private fb = inject(FormBuilder);
  orderListData: any = [];
  orderId: any;
  orderDetailList: any = {};
  isLoading: boolean = false;
  rateUsForm!: FormGroup;
  stars = [1, 2, 3, 4, 5];
  private platformId = inject(PLATFORM_ID);
  isBrowser: boolean;
  
  constructor() {
    this.isBrowser = isPlatformBrowser(this.platformId);

    effect(() => {
      if (this.signalService.userLoggedIn()) {
        this.addRateUsForm();
        this.orderList();
        this.cd.detectChanges();
      }
    });
  }

  ngOnInit() {
    let isLoggedIn: any = null;
    if (this.isBrowser) {
      isLoggedIn = JSON.parse(localStorage.getItem('isLoggedIn') || 'null');
    }

    if (!isLoggedIn) {

      this.signalService.openLoginPopup.set(true)
      return;

    }
     this.addRateUsForm();
    this.orderList();
  }
  addRateUsForm() {
    this.rateUsForm = this.fb.group({
      rating: [null, Validators.required],
      comment: [''],
    });
  }
  setRating(value: number): void {
    this.rateUsForm.patchValue({ rating: value });
  }
  // openRateUsModal(item:any){
  // //console.log('item===>',item);
  // this.orderId = item.id;
  // }
  submitRating(item:any='',productId:any='',index:any=''): void {
        let apiUrl = 'rate-product';
    if (this.rateUsForm.invalid) {
      this.rateUsForm.markAllAsTouched();
      return;
    }
    const payload = this.rateUsForm.value;
    if (!productId) {
         apiUrl = 'rate';
    }
console.log('this.rateUsForm==>',this.rateUsForm.value);
console.log('this.productid==>',productId);

    payload.product_id = productId;
    // payload.orderId = this.orderId;
    //console.log('Rating Submitted:', payload);
    this.dataService
      .post(payload, `orders/${this.orderId}/${apiUrl}`)
      .pipe(
        catchError((err) => {
          return of(err);
        })
      )
      .subscribe((res: any) => {
        //console.log('Response:===>', res);

        if (res?.success == true) {
          this.globalService.showMsgSnackBar(res);
          this.closeRatingPopup(index);
          item.product_review = {
            comment: payload.comment,
            rating:payload.rating
          }
          this.cd.detectChanges();
          // this.updateratingInorderList(productId);

          // this.router.navigate(['/cart']);
        }
        else if (res?.success == false) {
          this.globalService.showMsgSnackBar(res);

        }
        else if (res.error && res.error.message) {
          this.globalService.showMsgSnackBar(res.error);
          // this.closeRatingPopup();


        }
      });
    // 🔹 API call example
    // this.apiService.post('rate-us', payload).subscribe()

    this.rateUsForm.reset();
  }
updateratingInorderList(productId:any){
   this.dataService
      .get('orders')
      .pipe(
        catchError((err) => {
          return of(null);
        })
      )
      .subscribe((res: any) => {
        //console.log('Response:===>', res);
        if (res.success == true) {
          this.orderListData = res.data.data;
          // this.orderListData = [...res.data.data];


//            this.orderListData = this.orderListData.map((order:any) => {
//     if (order.id !== this.orderId) return order;
// console.log('order-------------------------',order);

//     return {
//       ...order,
//       items: order.items.map((line: any) =>
//       line.product_id === productId
//             ? {
//                 ...line,
//                 product_review: {
//                   ...line.product_review,
//                   rating: line.product_review.rating,
//                   comment: line.product_review.comment
//                 }
//               }
//             : line
//       )
//     };
//   });
          this.cd.detectChanges();

        }
      })
}
  deleteMyOrder(id: any) {
    this.orderId = id;
  }
  orderList() {
    this.isLoading = true;
    this.dataService
      .get('orders')
      .pipe(
        catchError((err) => {
          return of(null);
        })
      )
      .subscribe((res: any) => {
        //console.log('Response:===>', res);
        if (res.success == true) {
          this.orderListData = res.data.data;
          this.isLoading = false;
          this.cd.detectChanges();
          // this.router.navigate(['/cart']);
        }
      });
  }


  closeRatingPopup(index:any) {
    if (this.isBrowser) {
      const collapse = bootstrap.Collapse.getOrCreateInstance(
    this.collapseRefs.toArray()[index].nativeElement
  );
  collapse.hide();

  }
  }
  cancelOrder() {

  }

  getOrderDetailData(data: any) {
    this.orderDetailList = [];
    this.orderDetailList = data;
    //console.log('hiii',data);
    this.orderId = data.id;

  }
  // deleteOrder(){
  //  this.dataService.delete('wishlist',this.orderId).subscribe((res:any)=>{
  //     let response = {
  //         message:'Item Removed from Wish List',
  //         success:true
  //     }
  //     const modal = bootstrap.Modal.getInstance(
  //         this.orderDetail.nativeElement
  //       );
  //       modal.hide();
  //       this.orderList();
  //       this.cd.markForCheck();
  // }
  //  )
  // }
  addToCart(item: any) {
    //console.log('item==>', item);
    let isGuest: any = null;
    if (this.isBrowser) {
      isGuest = JSON.parse(localStorage.getItem('GUEST_TOKEN') || 'null');
    }
    let cartPayload = {
      product_id: item.product.id,
      quantity: item.quantity,
      guest_token: isGuest
    };
    this.dataService
      .post(cartPayload, 'cart')
      .pipe(
        catchError((err) => {
          console.error('Error:', err);
          return of(err);
        })
      )
      .subscribe((res: any) => {
        //console.log('Response:', res);
        if (res.success == true) {
          this.globalService.showMsgSnackBar(res);
          this.globalFunctionService.getCount();
          this.cd.detectChanges();

        } else if (res.error && res.error.message) {
          this.globalService.showMsgSnackBar(res.error);
        }
      });
  }
}
