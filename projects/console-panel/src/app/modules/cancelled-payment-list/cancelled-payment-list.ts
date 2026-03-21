import { ChangeDetectorRef, Component, inject, OnInit, signal, ViewChild, TemplateRef } from '@angular/core';
import { DataService } from 'shared-lib/services/data-service';
import { CommonModule } from '@angular/common';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { GlobaCommonlService } from 'shared-lib/services/global-common.service';

@Component({
  selector: 'app-cancelled-payment-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './cancelled-payment-list.html',
  styleUrl: './cancelled-payment-list.scss',
})
export class CancelledPaymentList implements OnInit {
  @ViewChild('detailsModal') detailsModal!: TemplateRef<any>;
  
  private dataService = inject(DataService);
  private cd = inject(ChangeDetectorRef);
  private ngbModal = inject(NgbModal);
  private fb = inject(FormBuilder);
  private globalService = inject(GlobaCommonlService);
  
  refundRequests = signal<any>(null);
  selectedRequest = signal<any>(null);
  currentPage = 1;
  modalRef?: NgbModalRef;
  processForm!: FormGroup;

  ngOnInit(): void {
    this.getRefundRequests();
    this.initProcessForm();
  }

  initProcessForm() {
    this.processForm = this.fb.group({
      status: ['processed', Validators.required],
      transaction_id: ['', [Validators.pattern(/^[a-zA-Z0-9]{8,25}$/)]],
      admin_notes: ['', Validators.required]
    });

    this.processForm.get('status')?.valueChanges.subscribe(value => {
      const transControl = this.processForm.get('transaction_id');
      if (value === 'processed') {
        transControl?.setValidators([Validators.required, Validators.pattern(/^[a-zA-Z0-9]{8,25}$/)]);
      } else {
        transControl?.clearValidators();
      }
      transControl?.updateValueAndValidity();
    });
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

  viewDetails(id: number) {
    this.dataService.get(`refund-requests/${id}`).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.selectedRequest.set(res.data.data || res.data);
          this.processForm.patchValue({
            status: 'processed',
            transaction_id: '',
            admin_notes: ''
          });
          
          // Re-set validation based on initial processed status
          const transControl = this.processForm.get('transaction_id');
          transControl?.setValidators([Validators.required, Validators.pattern(/^[a-zA-Z0-9]{8,25}$/)]);
          transControl?.updateValueAndValidity();

          this.modalRef = this.ngbModal.open(this.detailsModal, { size: 'lg', centered: true });
          this.cd.detectChanges();
        }
      }
    });
  }

  processRefund() {
    if (this.processForm.invalid) {
      this.processForm.markAllAsTouched();
      return;
    }

    const id = this.selectedRequest().id;
    const payload = {
      ...this.processForm.value,
      amount: this.selectedRequest().refund_amount
    };

    this.dataService.post(payload, `refund-requests/${id}/process`).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.globalService.showToast(res);
          this.modalRef?.close();
          this.getRefundRequests(this.currentPage);
        } else {
          this.globalService.showToast(res.error || res);
        }
      },
      error: (err) => {
        this.globalService.showToast(err.error || err);
      }
    });
  }

  nextPage(page: any) {
    if (!page || page === this.currentPage) return;
    this.getRefundRequests(page);
  }
}
