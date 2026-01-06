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
declare var bootstrap: any;

@Component({
  selector: 'app-my-orders',
  templateUrl: './my-orders.component.html',
  imports: [CommonModule, NoDataComponent],
  styleUrls: ['./my-orders.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MyOrdersComponent implements OnInit {
  @ViewChild('orderDetail') orderDetail!: ElementRef;
  dataService = inject(DataService);
  private cd = inject(ChangeDetectorRef);
  public globalService: any = inject(GlobaCommonlService);
  private globalFunctionService = inject(GlobalFunctionService);
  orderListData: any = [];
  orderId: any;
  orderDetailList: any;
  constructor() {}

  ngOnInit() {
    console.log('enter');

    this.orderList();
  }

  deleteMyOrder(id: any) {
    this.orderId = id;
  }
  orderList() {
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
          this.cd.detectChanges();
          // this.router.navigate(['/cart']);
        }
      });
  }

  getOrderDetailData(data: any) {
    console.log('hiii');
    this.orderDetailList = data;
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

    let cartPayload = {
      product_id: item.product.id,
      quantity: item.quantity,
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
