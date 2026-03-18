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

  ngOnInit(): void {
    this.getRefundRequests();
  }

  getRefundRequests() {
    this.dataService.get('refund-requests').subscribe({
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
}
