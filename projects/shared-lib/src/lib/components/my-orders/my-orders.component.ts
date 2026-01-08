import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  inject,
  OnInit,
  ViewChild,
} from '@angular/core';
import { catchError, of } from 'rxjs';
import { GlobaCommonlService } from '../../services/global-common.service';
import { DataService } from '../../services/data-service';
import { NoDataComponent } from '../no-data/no-data.component';
import { GlobalFunctionService } from '../../services/global-function.service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
declare var bootstrap: any;

@Component({
  selector: 'app-my-orders',
  templateUrl: './my-orders.component.html',
  imports: [CommonModule, NoDataComponent,ReactiveFormsModule],
  styleUrls: ['./my-orders.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MyOrdersComponent implements OnInit {
  @ViewChild('orderDetail') orderDetail!: ElementRef;
  dataService = inject(DataService);
  private cd = inject(ChangeDetectorRef);
  public globalService: any = inject(GlobaCommonlService);
  private globalFunctionService = inject(GlobalFunctionService);
  private fb = inject(FormBuilder);
  orderListData: any = [];
  orderId: any;
  orderDetailList: any;
  isLoading: boolean=true;
   rateUsForm!: FormGroup;
  stars = [1, 2, 3, 4, 5];
  constructor() {
    this.addRateUsForm();
  }

  ngOnInit() {
    this.orderList();
  }
  addRateUsForm(){
     this.rateUsForm = this.fb.group({
      rating: [null, Validators.required],
      comment: [''],
      orderId:[]
    });
  }
    setRating(value: number): void {
    this.rateUsForm.patchValue({ rating: value });
  }

  submitRating(): void {
    if (this.rateUsForm.invalid) {
      this.rateUsForm.markAllAsTouched();
      return;
    }

    const payload = this.rateUsForm.value;

    console.log('Rating Submitted:', payload);

    // 🔹 API call example
    // this.apiService.post('rate-us', payload).subscribe()

    this.rateUsForm.reset();
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
        console.log('Response:===>', res);
        if (res.success == true) {
          this.orderListData = res.data.data;
          this.isLoading = false;
          this.cd.detectChanges();
          // this.router.navigate(['/cart']);
        }
      });
  }


  cancelOrder(){

  }
  getOrderDetailData(data: any) {
    this.orderDetailList = data;
    console.log('hiii',data);
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
    console.log('item==>', item);
      let isGuest: any = JSON.parse(localStorage.getItem('GUEST_TOKEN') || 'null');
    let cartPayload = {
      product_id: item.product.id,
      quantity: item.quantity,
      guest_token:isGuest
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
        console.log('Response:', res);
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
