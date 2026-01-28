import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, ElementRef, inject, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { catchError, of } from 'rxjs';
import { GlobaCommonlService } from '../../services/global-common.service';
import { DataService } from '../../services/data-service';
import { ActivatedRoute, Router } from '@angular/router';
declare var bootstrap: any;
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
  @ViewChild('rateusModal') rateusModal!: ElementRef;
  public globalService: any = inject(GlobaCommonlService);
  private cd = inject(ChangeDetectorRef);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  orderId: any;
  ratingValue: any;

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      // console.log('Order ID:', params['orderId']);
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
    const modal = new bootstrap.Modal(this.rateusModal.nativeElement);
    modal.show();
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
        //console.log('Response:===>', res);

        if (res?.success == true) {
          this.globalService.showMsgSnackBar(res);
          this.rateUsForm.reset();
          this.cd.detectChanges();
          const modalElement = this.rateusModal.nativeElement;
          const modalInstance =
            bootstrap.Modal.getInstance(modalElement) || new bootstrap.Modal(modalElement);
          modalInstance.hide();
          this.router.navigate(['/user-profile'], {
            queryParams: { section: 'Orders' },
            queryParamsHandling: 'merge',
            replaceUrl: true,
          });
          // this.updateratingInorderList(productId);

          // this.router.navigate(['/cart']);
        } else if (res?.success == false) {
          this.globalService.showMsgSnackBar(res);
          const modalElement = this.rateusModal.nativeElement;
          const modalInstance =
            bootstrap.Modal.getInstance(modalElement) || new bootstrap.Modal(modalElement);
          modalInstance.hide();
          this.router.navigate(['/user-profile'], {
            queryParams: { section: 'Orders' },
            queryParamsHandling: 'merge',
            replaceUrl: true,
          });
        } else if (res.error && res.error.message) {
          const modalElement = this.rateusModal.nativeElement;
          const modalInstance =
            bootstrap.Modal.getInstance(modalElement) || new bootstrap.Modal(modalElement);
          this.router.navigate(['/user-profile'], {
            queryParams: { section: 'Orders' },
            queryParamsHandling: 'merge',
            replaceUrl: true,
          });
          modalInstance.hide();
          this.globalService.showMsgSnackBar(res.error);
          // this.closeRatingPopup();
        }
      });
    // 🔹 API call example
    // this.apiService.post('rate-us', payload).subscribe()
  }
  setRating(value: number): void {
    console.log("ratings", value)
    this.ratingValue = value;
    this.rateUsForm.patchValue({ rating: value });
  }
}
