import { Component, ChangeDetectorRef, inject, TemplateRef, ViewChild, OnInit } from '@angular/core';
import { Sidebar } from '../../layout/sidebar/sidebar';
import { Header } from '../../layout/header/header';
import { DataService } from 'shared-lib/services/data-service';
import { DatePipe } from '@angular/common';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-dashboard',
  imports: [Sidebar, Header, DatePipe],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
  standalone: true
})
export class Dashboard implements OnInit {
  dataService = inject(DataService);
  private cd = inject(ChangeDetectorRef);
  private ngbModal = inject(NgbModal);
  @ViewChild('orderPreviewModal') orderPreviewModal!: TemplateRef<any>;
  orderPreviewRef?: NgbModalRef;
  selectedOrder: any;
  dashBoardData: any = {};
  orderSummary: any = {
    completed: 0,
    pending: 0,
    today: 0,
    total: 0,
  };

  ngOnInit() {
    this.getDashboardData();
  }

  getDashboardData() {
    this.dataService.get('dashboard').subscribe((res: any) => {
      // console.log('res===>', res);
      this.dashBoardData = res.data;

      const summarySource =
        res?.data?.order_summary || res?.data?.orders || res?.data?.order || res?.data || {};

      this.orderSummary = {
        completed: Number(summarySource?.completed ?? 0),
        pending: Number(summarySource?.pending ?? 0),
        today: Number(summarySource?.today ?? 0),
        total: Number(summarySource?.total ?? 0),
      };
      this.cd.detectChanges();
    });
  }

  openOrderPreview(order: any): void {
    if (!this.orderPreviewModal) return;
    this.selectedOrder = order;
    this.orderPreviewRef = this.ngbModal.open(this.orderPreviewModal, {
      size: 'lg',
      centered: true,
      scrollable: true,
    });
  }

  closeOrderPreview(): void {
    this.orderPreviewRef?.close();
    this.orderPreviewRef = undefined;
  }

  downloadInvoice(order: any) {
    // console.info('downloadInvoice===>', order);
    this.dataService.downloadReport(`orders/${order.id}/invoice`, `${order.downloadInvoceName}`);
  }
}
