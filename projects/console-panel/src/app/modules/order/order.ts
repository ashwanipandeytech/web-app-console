import { Component, ChangeDetectorRef, inject, ViewChild, TemplateRef } from '@angular/core';
import { DatePipe } from '@angular/common';
import { DataService } from '../../../../../shared-lib/src/lib/services/data-service';
import { GlobaCommonlService } from '../../../../../shared-lib/src/lib/services/global-common.service';
import { catchError, of } from 'rxjs';

import { Sidebar } from '../../layout/sidebar/sidebar';
import { Header } from '../../layout/header/header';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-order',
  imports: [Sidebar, Header, DatePipe, ReactiveFormsModule],
  templateUrl: './order.html',
  styleUrl: './order.scss',
})
export class Order {
  @ViewChild('editOrderModal') editOrderModal!: TemplateRef<any>;
  orderForm!: FormGroup;
  selectedOrder: any;
  readonly orderStatusOptions: Array<{ label: string; value: string }> = [
    { label: 'Shipped', value: 'shipped' },
    { label: 'Intransit', value: 'intransit' },
    { label: 'Out for delivery', value: 'out_for_delivery' },
    { label: 'Delivered', value: 'delivered' },
  ];
  private readonly orderStatusMap = new Map(
    this.orderStatusOptions.map((status) => [status.value, status.label])
  );
  updatingOrderId: number | string | null = null;
  public dataService: any = inject(DataService);
  private globalService = inject(GlobaCommonlService);
  private modalService = inject(NgbModal);
  private fb = inject(FormBuilder);
  orderListData: any = [];
  defaultPage = 1;
  constructor(private cd: ChangeDetectorRef) {
    this.createForm();
    this.getOrderList();
  }

  createForm() {
    this.orderForm = this.fb.group({
      customer: ['', Validators.required],
      status: ['', Validators.required],
      product: ['', Validators.required],
      price: ['', Validators.required],
      payment_method: ['', Validators.required],
    });
  }

  openEditModal(order: any) {
    this.selectedOrder = order;

    this.orderForm.patchValue({
      customer: order.customer,
      status: order.status,
      product: order.product,
      price: order.price,
      payment_method: order.payment_method,
    });

    this.modalService.open(this.editOrderModal, {
      centered: true,
      size: 'lg',
      backdrop: 'static',
    });
  }
 nextPage(page:any){
// this.defaultPage = page;
this.getOrderList();
  }

  downloadInvoice(order: any) {
  
    this.dataService.downloadReport(`orders/${order.id}/invoice`, `${order.downloadInvoceName}`);
  }

  onStatusChange(order: any, event: Event) {
    const selectElement = event.target as HTMLSelectElement | null;
    const nextStatus = this.normalizeStatus(selectElement?.value);
    const previousStatus = this.normalizeStatus(order?.status);

    if (!order?.id || !nextStatus || nextStatus === previousStatus) {
      return;
    }

    this.updatingOrderId = order.id;
    order.status = nextStatus;
    this.cd.detectChanges();

    this.updateOrderStatus(order.id, nextStatus)
      .pipe(
        catchError((err) => {
          order.status = previousStatus;
          this.globalService.showToast(
            err?.error || { success: false, message: 'Unable to update order status.' }
          );
          return of(null);
        })
      )
      .subscribe((res: any) => {
        this.updatingOrderId = null;

        if (res?.success === true) {
          order.status = nextStatus;
          this.globalService.showToast(res);
        } else if (res?.success === false) {
          order.status = previousStatus;
          this.globalService.showToast(res);
        } else if (res?.error) {
          order.status = previousStatus;
          this.globalService.showToast(res.error);
        }

        this.cd.detectChanges();
      });
  }

  statusLabel(status: string | null | undefined) {
    const normalizedStatus = this.normalizeStatus(status);
    return this.orderStatusMap.get(normalizedStatus) || status || 'Select status';
  }

  isKnownStatus(status: string | null | undefined) {
    return this.orderStatusMap.has(this.normalizeStatus(status));
  }

   normalizeStatus(status: string | null | undefined) {
    const normalized = String(status || '').trim().toLowerCase();

    if (normalized === 'in transit' || normalized === 'in_transit') {
      return 'intransit';
    }
    if (normalized === 'out for delivery' || normalized === 'out-for-delivery') {
      return 'out_for_delivery';
    }

    return normalized;
  }

  private updateOrderStatus(orderId: number | string, status: string) {
    const payload = { status };

    return this.dataService.update('orders',payload,orderId)
  }

  submit(modal: any) {
    if (this.orderForm.invalid) return;

    const payload = {
      ...this.selectedOrder,
      ...this.orderForm.value,
    };

    // console.log('Updated Order:', payload);

    // 🔥 call update API here
    // this.orderService.updateOrder(payload).subscribe()

    modal.close();
  }
  
  getOrderList() {
    this.orderListData = [];
    
    this.dataService
      .get(`orders?page=${this.defaultPage}`)
      .pipe(
        catchError((err) => {
          console.error('Error:', err);
          return of(null);
        })
      )
      .subscribe((res: any) => {
        this.orderListData = res.data;
        console.log('this.orderListData===>',this.orderListData);
        
        this.cd.detectChanges();
      });
  }
}
