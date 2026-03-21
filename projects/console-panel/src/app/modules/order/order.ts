import { Component, ChangeDetectorRef, inject, ViewChild, TemplateRef } from '@angular/core';
import { DatePipe } from '@angular/common';
import { DataService } from '../../../../../shared-lib/src/lib/services/data-service';
import { GlobaCommonlService } from '../../../../../shared-lib/src/lib/services/global-common.service';
import { catchError, of } from 'rxjs';
import { environment } from 'environments/environment';

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

  updateStatus(order: any, newStatus: string) {
    const payload = { status: newStatus };
    this.dataService.patch(`orders/${order.id}/status`, payload).pipe(
      catchError(err => {
        this.globalService.showToast(err.error || err);
        return of(null);
      })
    ).subscribe((res: any) => {
      if (res && res.success) {
        order.status = newStatus;
        this.globalService.showToast(res);
        this.cd.detectChanges();
      }
    });
  }
}
