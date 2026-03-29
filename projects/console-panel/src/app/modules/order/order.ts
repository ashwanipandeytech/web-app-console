import { Component, ChangeDetectorRef, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { catchError, of } from 'rxjs';
import { DataService } from 'shared-lib/services/data-service';
import { GlobaCommonlService } from 'shared-lib/services/global-common.service';

import { Sidebar } from '../../layout/sidebar/sidebar';
import { Header } from '../../layout/header/header';
import { OrderDetailModalComponent } from './order-detail-modal.component';

@Component({
  selector: 'app-order',
  standalone: true,
  imports: [Sidebar, Header, DatePipe, FormsModule],
  templateUrl: './order.html',
  styleUrl: './order.scss',
})
export class Order {
  public dataService: any = inject(DataService);
  private globalService = inject(GlobaCommonlService);
  private modalService = inject(NgbModal);

  orderListData: any = { data: [], links: [] };
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
    this.getOrderList();
  }

  isStatusAllowed(order: any, targetStatus: string): boolean {
    const currentStatus = order?.status;
    if (currentStatus === targetStatus) return true;

    const returnStatuses = ['return_requested', 'return_approved', 'return_picked_up', 'return_rejected', 'returned'];
    if (order?.payment_method?.toLowerCase() === 'cod' && returnStatuses.includes(targetStatus)) {
      return false;
    }

    const flow: Record<string, string[]> = {
      pending: ['confirmed', 'cancelled'],
      confirmed: ['processing', 'cancelled'],
      processing: ['dispatched', 'cancelled'],
      dispatched: ['shipped', 'cancelled'],
      shipped: ['out_for_delivery', 'cancelled'],
      out_for_delivery: ['delivered', 'cancelled'],
      delivered: ['return_requested'],
      return_requested: ['return_approved', 'return_rejected', 'returned'],
      return_approved: ['return_picked_up', 'returned', 'cancelled'],
      return_picked_up: ['returned'],
      return_rejected: [],
      cancelled: [],
      returned: [],
    };

    return (flow[currentStatus] || []).includes(targetStatus);
  }

  nextPage(page: any): void {
    if (!page) return;
    this.defaultPage = page;
    this.getOrderList();
  }

  viewOrder(order: any): void {
    const modalRef = this.modalService.open(OrderDetailModalComponent, {
      centered: true,
      size: 'xl',
      scrollable: true,
    });

    modalRef.componentInstance.order = order;
  }

  getCustomerName(order: any): string {
    return (
      order?.user?.name ||
      order?.customer?.name ||
      order?.address?.name ||
      order?.customer_name ||
      '-'
    );
  }

  getPrimaryProductTitle(order: any): string {
    const items = Array.isArray(order?.items) ? order.items : [];
    const primaryTitle =
      items[0]?.product?.title ||
      items[0]?.title ||
      order?.summary?.title ||
      '-';

    if (items.length <= 1) {
      return primaryTitle;
    }

    return `${primaryTitle} +${items.length - 1} more`;
  }

  downloadInvoice(order: any): void {
    this.dataService.downloadReport(`orders/${order.id}/invoice`, `${order.downloadInvoceName}`);
  }

  downloadPaySlip(order: any): void {
    this.dataService.downloadReport(`orders/${order.id}/shipping-label`, `${order.downloadInvoceName}`);
  }

  getOrderList(): void {
    this.orderListData = { data: [], links: [] };

    this.dataService
      .get(`orders?page=${this.defaultPage}`)
      .pipe(
        catchError((err) => {
          console.error('Error:', err);
          return of(null);
        })
      )
      .subscribe((res: any) => {
        this.orderListData = res?.data || { data: [], links: [] };

        if (Array.isArray(this.orderListData?.data)) {
          this.orderListData.data.forEach((order: any) => {
            if (order?.status) {
              order.status = String(order.status).toLowerCase();
            }
          });
        }

        this.cd.detectChanges();
      });
  }

  updateStatus(order: any, newStatus: string, previousStatus: string): void {
    const payload = { status: newStatus };
    this.dataService
      .patch(`orders/${order.id}/status`, payload)
      .pipe(
        catchError((err: any) => {
          this.globalService.showToast(err.error || err);
          order.status = previousStatus;
          this.cd.detectChanges();
          return of(null);
        })
      )
      .subscribe((res: any) => {
        if (res && res.success) {
          order.status = newStatus;
          this.globalService.showToast(res);
          this.cd.detectChanges();
          return;
        }

        if (res && !res.success) {
          this.globalService.showToast(res.error || res);
        }

        order.status = previousStatus;
        this.cd.detectChanges();
      });
  }
}
