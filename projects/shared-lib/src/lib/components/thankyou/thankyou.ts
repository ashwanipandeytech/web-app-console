import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, ElementRef, inject, ViewChild, TemplateRef } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { catchError, of } from 'rxjs';
import { GlobaCommonlService } from '../../services/global-common.service';
import { DataService } from '../../services/data-service';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'web-thankyou',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './thankyou.html',
  styleUrl: './thankyou.scss',
})
export class Thankyou {
  stars = [1, 2, 3, 4, 5];
  rateUsForm!: FormGroup;
  dataService = inject(DataService);
  fb = inject(FormBuilder);
  @ViewChild('rateusModal') rateusModal!: TemplateRef<any>;
  private ngbModal = inject(NgbModal);
  private modalRef?: NgbModalRef;
  public globalService: any = inject(GlobaCommonlService);
  private cd = inject(ChangeDetectorRef);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  orderId: any;
  ratingValue: any;

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      // // console.log('Order ID:', params['orderId']);
      this.orderId = params['orderId'];
    });
    this.addRateUsForm();
  }
  ngAfterViewInit() {
    setTimeout(() => {
      this.openRateUsModal();
    }, 500);
  }
  openRateUsModal() {
    this.modalRef = this.ngbModal.open(this.rateusModal, {
      size: 'md',
      windowClass: 'mobile-modal',
      centered: true,
      backdrop: 'static',
      keyboard: false
    });

    this.modalRef.result.then(
      () => {},
      () => {
        // Handle dismissal (Skip for now / Cross click)
        this.router.navigate(['/user-profile'], {
          queryParams: { section: 'Orders' },
          queryParamsHandling: 'merge',
          replaceUrl: true,
        });
      }
    );
  }
  addRateUsForm() {
    this.rateUsForm = this.fb.group({
      rating: [null, Validators.required],
      comment: [''],
    });
  }
  submitRating(): void {
    if (this.rateUsForm.invalid) {
      this.rateUsForm.markAllAsTouched();
      return;
    }
    const payload = this.rateUsForm.value;
    this.dataService
      .post(payload, `orders/${this.orderId}/rate`)
      .pipe(
        catchError((err) => {
          return of(err);
        }),
      )
      .subscribe((res: any) => {
        if (res?.success == true) {
          this.globalService.showToast(res);
          this.rateUsForm.reset();
          this.cd.detectChanges();
          if (this.modalRef) {
            this.modalRef.close();
          }
          this.router.navigate(['/user-profile'], {
            queryParams: { section: 'Orders' },
            queryParamsHandling: 'merge',
            replaceUrl: true,
          });
        } else if (res?.success == false) {
          this.globalService.showToast(res);
          if (this.modalRef) {
            this.modalRef.close();
          }
          this.router.navigate(['/user-profile'], {
            queryParams: { section: 'Orders' },
            queryParamsHandling: 'merge',
            replaceUrl: true,
          });
        } else if (res.error && res.error.message) {
          if (this.modalRef) {
            this.modalRef.close();
          }
          this.router.navigate(['/user-profile'], {
            queryParams: { section: 'Orders' },
            queryParamsHandling: 'merge',
            replaceUrl: true,
          });
          this.globalService.showToast(res.error);
        }
      });
  }
  setRating(value: number): void {
    // console.log("ratings", value)
    this.ratingValue = value;
    this.rateUsForm.patchValue({ rating: value });
  }
}
