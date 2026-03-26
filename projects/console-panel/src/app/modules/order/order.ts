import { Component, ChangeDetectorRef, inject, ViewChild, TemplateRef } from '@angular/core';
import { DatePipe } from '@angular/common';
import { DataService } from '../../../../../shared-lib/src/lib/services/data-service';
import { GlobaCommonlService } from '../../../../../shared-lib/src/lib/services/global-common.service';
import { catchError, of } from 'rxjs';

import { Sidebar } from '../../layout/sidebar/sidebar';
import { Header } from '../../layout/header/header';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-order',
  imports: [Sidebar, Header, DatePipe, ReactiveFormsModule, FormsModule],
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

  readonly allStatuses = [
    { value: 'pending', label: 'Pending' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'processing', label: 'Processing' },
    { value: 'dispatched', label: 'Dispatched' },
    { value: 'shipped', label: 'Shipped' },
    { value: 'out_for_delivery', label: 'Out for Delivery' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'cancelled', label: 'Cancelled' },
    { value: 'return_requested', label: 'Return Requested' },
    { value: 'return_approved', label: 'Return Approved' },
    { value: 'return_picked_up', label: 'Return Picked Up' },
    { value: 'return_rejected', label: 'Return Rejected' },
    { value: 'returned', label: 'Returned' },
  ];

  constructor(private cd: ChangeDetectorRef) {
    this.createForm();
    this.getOrderList();
  }

  isStatusAllowed(order: any, targetStatus: string): boolean {
    const currentStatus = order.status;
    if (currentStatus === targetStatus) return true;

    // COD orders cannot have any return-related statuses in this console
    const returnStatuses = ['return_requested', 'return_approved', 'return_picked_up', 'return_rejected', 'returned'];
    if (order.payment_method?.toLowerCase() === 'cod' && returnStatuses.includes(targetStatus)) {
      return false;
    }

    const flow: any = {
      'pending': ['confirmed', 'cancelled'],
      'confirmed': ['processing', 'cancelled'],
      'processing': ['dispatched', 'cancelled'],
      'dispatched': ['shipped', 'cancelled'],
      'shipped': ['out_for_delivery', 'cancelled'],
      'out_for_delivery': ['delivered', 'cancelled'],
      'delivered': ['return_requested'],
      'return_requested': ['return_approved', 'return_rejected', 'returned'],
      'return_approved': ['return_picked_up', 'returned', 'cancelled'],
      'return_picked_up': ['returned'],
      'return_rejected': [],
      'cancelled': [],
      'returned': []
    };

    const allowed = flow[currentStatus] || [];
    return allowed.includes(targetStatus);
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

  // hasPaySlip(order: any): boolean {
  //   return this.getPaySlipLink(order) !== '';
  // }

  downloadPaySlip(order: any) {
    this.dataService.downloadReport(`orders/${order.id}/shipping-label`, `${order.downloadInvoceName}`);
    // const paySlipLink = this.getPaySlipLink(order);
    // if (!paySlipLink) {
    //   this.globalService.showToast({
    //     success: false,
    //     message: 'Payslip link is not available for this order.',
    //   });
    //   return;
    // }

    // if (typeof window === 'undefined' || typeof document === 'undefined') {
    //   return;
    // }

    // const anchor = document.createElement('a');
    // anchor.href = paySlipLink;
    // anchor.target = '_blank';
    // anchor.rel = 'noopener noreferrer';
    // anchor.download = this.getPaySlipFileName(paySlipLink, order);
    // document.body.appendChild(anchor);
    // anchor.click();
    // document.body.removeChild(anchor);
  }

  // private getPaySlipLink(order: any): string {
  //   const candidates = [
  //     order?.pay_slip,
  //     order?.pay_slip?.url,
  //     order?.pay_slip?.download_link,
  //     order?.paySlip,
  //   ];

  //   for (const candidate of candidates) {
  //     if (typeof candidate === 'string' && candidate.trim() !== '') {
  //       return candidate.trim();
  //     }
  //   }

  //   return '';
  // }

  // private getPaySlipFileName(url: string, order: any): string {
  //   const explicitName = String(
  //     order?.pay_slip_file_name || order?.payslip_file_name || ''
  //   ).trim();
  //   if (explicitName) {
  //     return explicitName;
  //   }

  //   try {
  //     const parsedUrl = new URL(url, window.location.origin);
  //     const nameFromPath = parsedUrl.pathname.split('/').pop();
  //     if (nameFromPath) {
  //       return nameFromPath;
  //     }
  //   } catch (error) {
  //     // Falls back to default name below.
  //   }

  //   return `payslip-order-${order?.id || 'file'}.pdf`;
  // }

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
        if (this.orderListData && this.orderListData.data) {
          this.orderListData.data.forEach((order: any) => {
            if (order.status) {
              order.status = order.status.toLowerCase();
            }
          });
        }
        console.log('this.orderListData===>',this.orderListData);
        
        this.cd.detectChanges();
      });
  }

  updateStatus(order: any, newStatus: string, previousStatus: string) {
    const payload = { status: newStatus };
    this.dataService.patch(`orders/${order.id}/status`, payload).pipe(
      catchError(err => {
        this.globalService.showToast(err.error || err);
        order.status = previousStatus;
        this.cd.detectChanges();
        return of(null);
      })
    ).subscribe((res: any) => {
      if (res && res.success) {
        order.status = newStatus;
        this.globalService.showToast(res);
        this.cd.detectChanges();
      } else {
        if (res && !res.success) {
          this.globalService.showToast(res.error || res);
        }
        order.status = previousStatus;
        this.cd.detectChanges();
      }
    });
  }
}
