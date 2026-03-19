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
  Inject,
  PLATFORM_ID,
  QueryList,
  ViewChildren,
  TemplateRef
} from '@angular/core';
import { catchError, of } from 'rxjs';
import { GlobaCommonlService } from '../../services/global-common.service';
import { DataService } from '../../services/data-service';
import { NoDataComponent } from '../no-data/no-data.component';
import { GlobalFunctionService } from '../../services/global-function.service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { SignalService } from '../../services/signal-service';
import { MobileBottomNavComponent } from '../mobile-bottom-nav/mobile-bottom-nav.component';
import { Router, RouterLink } from '@angular/router';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-my-orders',
  templateUrl: './my-orders.component.html',
  imports: [CommonModule, NoDataComponent, ReactiveFormsModule, MobileBottomNavComponent, RouterLink],
  styleUrls: ['./my-orders.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MyOrdersComponent implements OnInit {
  @ViewChild('orderDetail') orderDetail!: TemplateRef<any>;
  @ViewChild('rateusModal') rateusModal!: TemplateRef<any>;
  @ViewChild('confirmCancelOrder') confirmCancelOrder!: TemplateRef<any>;
  @ViewChildren('collapseRef') collapseRefs!: QueryList<ElementRef>;
  
  private ngbModal = inject(NgbModal);
  private modalRef?: NgbModalRef;
  private cancelModalRef?: NgbModalRef;
  dataService = inject(DataService);
  private cd = inject(ChangeDetectorRef);
  public globalService: any = inject(GlobaCommonlService);
  private globalFunctionService = inject(GlobalFunctionService);
  private signalService = inject(SignalService);
  private fb = inject(FormBuilder);
  private route = inject(Router);
  orderListData: any = [];
  orderId: any;
  orderDetailList: any = {};
  isLoading: boolean = false;
  rateUsForm!: FormGroup;
  bankDetailsForm!: FormGroup;
  isReturnAction: boolean = false;
  selectedItems: number[] = [];
  stars = [1, 2, 3, 4, 5];
  private platformId = inject(PLATFORM_ID);
  isBrowser: boolean;
  isLoggedIn:boolean= false;

  get canCancelAnyItem(): boolean {
    return this.orderDetailList?.actions?.can_cancel || 
           this.orderDetailList?.items?.some((item: any) => item.actions?.can_cancel);
  }

  get canReturnAnyItem(): boolean {
    return this.orderDetailList?.actions?.can_return || 
           this.orderDetailList?.items?.some((item: any) => item.actions?.can_return);
  }

  constructor() {
    this.isBrowser = isPlatformBrowser(this.platformId);

    effect(() => {
      if (this.signalService.userLoggedIn()) {
        this.isLoggedIn = true;
        this.orderList();
        this.cd.detectChanges();
      }
    });
  }

  ngOnInit() {
    this.isLoggedIn = false;
    console.info('hererer')
      this.orderList();
      this.addRateUsForm();
      this.initBankDetailsForm();
      this.cd.detectChanges();

    if (this.isBrowser) {
      this.isLoggedIn = JSON.parse(localStorage.getItem('isLoggedIn') || 'null');
      this.cd.detectChanges();

    }

    if (!this.isLoggedIn) {
     // this.signalService.openLoginPopup.set(true);
      this.cd.detectChanges();
      // return;

    }
    this.addRateUsForm();
      this.cd.detectChanges();

  }
  addRateUsForm() {
    this.rateUsForm = this.fb.group({
      rating: [null, Validators.required],
      comment: [''],
    });
  }
  initBankDetailsForm() {
    this.bankDetailsForm = this.fb.group({
      account_name: ['', [
        Validators.required, 
        Validators.minLength(3), 
        Validators.pattern(/^[a-zA-Z ]+$/)
      ]],
      account_number: ['', [
        Validators.required, 
        Validators.pattern(/^[0-9]{9,18}$/)
      ]],
      ifsc_code: ['', [
        Validators.required, 
        Validators.pattern(/^[A-Z]{4}0[A-Z0-9]{6}$/)
      ]],
      bank_name: ['', [Validators.required, Validators.minLength(2)]],
    });
  }
  setRating(value: number): void {
    this.rateUsForm.patchValue({ rating: value });
  }
  // openRateUsModal(item:any){
  // //console.log('item===>',item);
  // this.orderId = item.id;
  // }
  submitRating(item: any = '', productId: any = '', index: any = ''): void {
    let apiUrl = 'rate-product';
    if (this.rateUsForm.invalid) {
      this.rateUsForm.markAllAsTouched();
      return;
    }
    const payload = this.rateUsForm.value;
    if (!productId) {
      apiUrl = 'rate';
    }
    console.log('this.rateUsForm==>', this.rateUsForm.value);
    console.log('this.productid==>', productId);

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
          this.globalService.showToast(res);
          this.closeRatingPopup(index);
          item.product_review = {
            comment: payload.comment,
            rating: payload.rating
          }
          this.cd.detectChanges();
          // this.updateratingInorderList(productId);

          // this.router.navigate(['/cart']);
        }
        else if (res?.success == false) {
          this.globalService.showToast(res);

        }
        else if (res.error && res.error.message) {
          this.globalService.showToast(res.error);
          // this.closeRatingPopup();


        }
      });
    // 🔹 API call example
    // this.apiService.post('rate-us', payload).subscribe()

    this.rateUsForm.reset();
  }
  updateratingInorderList(productId: any) {
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
    // this.isLoading = true;
    this.dataService
      .get('orders')
      .pipe(
        catchError((err) => {
          return of(null);
        })
      )
      .subscribe((res: any) => {
        console.log('Response:===>', res);
        if (res?.success == true) {
          this.orderListData = res.data;
          console.log('orderListData==>',this.orderListData);

          this.orderListData.map((item: any) => {

            item.expected_delivery = this.getFormattedDeliveryDate(item.created_at)
          });
          this.isLoading = false;
          this.cd.detectChanges();
          // this.router.navigate(['/cart']);
        }
        else if(res==null){
          this.orderListData = [];
          console.log(this.orderListData);
          this.cd.detectChanges();

        }
      });
  }
  getFormattedDeliveryDate(createdAt: string): string {
    const date = new Date(createdAt);
    date.setDate(date.getDate() + 5);

    // Returns "Jan 31"
    return date.toLocaleString('en-US', { month: 'short', day: '2-digit' });
  }


  closeRatingPopup(index: any) {
     // No manual hide needed with NgbModal as it doesn't affect collapse, 
     // but if it's a bootstrap collapse we might need to handle it.
     // For now focusing on the Modal refactoring.
  }
  
  openCancelOrderModal(isReturn: boolean = false, item?: any) {
    this.isReturnAction = isReturn;
    this.selectedItems = item ? [item.id] : [];
    this.cancelModalRef = this.ngbModal.open(this.confirmCancelOrder, {
      windowClass: 'mobile-modal',
      centered: true
    });
  }

  cancelOrder() {
    let payload: any = {};
    const endpoint = this.isReturnAction ? 'return' : 'cancel';

    if (this.selectedItems.length > 0) {
      payload.item_ids = this.selectedItems;
    }

    // Only require bank details for COD Returns (Refund needed)
    if (this.orderDetailList?.payment_method === 'cod' && this.isReturnAction) {
      if (this.bankDetailsForm.invalid) {
        this.bankDetailsForm.markAllAsTouched();
        return;
      }
      payload.bank_details = this.bankDetailsForm.value;
    }

    if (this.cancelModalRef) {
      this.cancelModalRef.close();
    }

    this.dataService
      .post(payload, `orders/${this.orderId}/${endpoint}`)
      .pipe(
        catchError((err) => {
          console.error('Error:', err);
          return of(err);
        })
      )
      .subscribe((res: any) => {
        if (res.success == true) {
          this.globalService.showToast(res);
          this.globalFunctionService.getCount();
          this.orderList();
          if (this.modalRef) this.modalRef.close();
          this.cd.detectChanges();
        } else if (res.error && res.error.message) {
          this.globalService.showToast(res.error);
        }
      });
  }

  downloadInvoice(order: any) {
    console.info('downloadInvoice===>', order);
    this.dataService.downloadReport(`orders/${this.orderId}/invoice`, `${order.downloadInvoceName}`);
  }

  getOrderDetailData(data: any) {
    this.orderId = data.id;
    this.orderDetailList = data; // Set initial data from list
    
    // Fetch fresh details for latest actions and timeline
    this.dataService.get(`orders/${this.orderId}`).subscribe((res: any) => {
      if (res.success) {
        this.orderDetailList = res.data.data || res.data;
        // Map order-level timeline if available
        if (this.orderDetailList.timeline) {
          this.orderDetailList.item_timeline = this.orderDetailList.timeline;
        }
        this.cd.detectChanges();
      }
    });

    this.modalRef = this.ngbModal.open(this.orderDetail, {
      size: 'lg',
      scrollable: true,
      centered: true
    });
  }

  closeModal() {
    if (this.modalRef) {
      this.modalRef.close();
    }
  }

  addToCart(item: any) {
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
        if (res.success == true) {
          this.globalService.showToast(res);
          this.globalFunctionService.getCount();
          this.cd.detectChanges();
        } else if (res.error && res.error.message) {
          this.globalService.showToast(res.error);
        }
      });
  }
  
  goToHelp() {
    this.closeModal();
    this.route.navigate(['/contact-us']);
  }
}
