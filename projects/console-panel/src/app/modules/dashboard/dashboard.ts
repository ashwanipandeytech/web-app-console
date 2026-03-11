import { Component, ChangeDetectorRef, inject, TemplateRef, ViewChild } from '@angular/core';
import { Sidebar } from '../../layout/sidebar/sidebar';
import { Header } from '../../layout/header/header';
import { DataService } from 'shared-lib/services/data-service';
import { DatePipe } from '@angular/common';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
@Component({
  selector: 'app-dashboard',
  imports: [Sidebar, Header, DatePipe],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard {
  dataService = inject(DataService);
  private cd = inject(ChangeDetectorRef);
  dialog = inject(MatDialog);
  @ViewChild('orderPreviewModal') orderPreviewModal!: TemplateRef<any>;
  orderPreviewRef?: MatDialogRef<any>;
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
      console.log('res===>', res);
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
    this.orderPreviewRef = this.dialog.open(this.orderPreviewModal, {
      width: '750px',
      maxWidth: '95vw',
      data: order,
    });
  }

  closeOrderPreview(): void {
    this.orderPreviewRef?.close();
    this.orderPreviewRef = undefined;
  }
}
