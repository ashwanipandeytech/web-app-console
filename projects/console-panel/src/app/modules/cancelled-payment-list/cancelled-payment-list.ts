import { ChangeDetectorRef, Component, inject, OnInit, signal } from '@angular/core';
import { DataService } from 'shared-lib/services/data-service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-cancelled-payment-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cancelled-payment-list.html',
  styleUrl: './cancelled-payment-list.scss',
})
export class CancelledPaymentList implements OnInit {
  private dataService = inject(DataService);
  private cd = inject(ChangeDetectorRef);
  
  refundRequests = signal<any>(null);
  currentPage = 1;

  ngOnInit(): void {
    this.getRefundRequests();
  }

  getRefundRequests(page: number = 1) {
    this.currentPage = page;
    this.dataService.get(`refund-requests?page=${this.currentPage}`).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.refundRequests.set(res.data || []);
          this.cd.detectChanges();
        }
      },
      error: (err) => {
        console.error('Error fetching refund requests', err);
      }
    });
  }

  nextPage(page: any) {
    if (!page || page === this.currentPage) return;
    this.getRefundRequests(page);
  }
}
