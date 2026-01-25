import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, ElementRef, inject, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { catchError, of } from 'rxjs';
import { GlobaCommonlService } from 'shared-lib/services/global-common.service';
import { DataService } from 'shared-lib/services/data-service';
import { ActivatedRoute } from '@angular/router';
declare var bootstrap: any;
@Component({
  selector: 'web-thankyou',
  imports: [ReactiveFormsModule,CommonModule],
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
  orderId: any;

  ngOnInit() {
  this.route.queryParams.subscribe(params => {
    console.log('Order ID:', params['orderId']);
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
    const modal = new bootstrap.Modal(
      this.rateusModal.nativeElement
    );
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
         })
       )
       .subscribe((res: any) => {
         //console.log('Response:===>', res);
 
         if (res?.success == true) {
           this.globalService.showMsgSnackBar(res);
           this.rateUsForm.reset();
           this.cd.detectChanges();
           // this.updateratingInorderList(productId);
 
           // this.router.navigate(['/cart']);
         }
         else if (res?.success == false) {
           this.globalService.showMsgSnackBar(res);
 
         }
         else if (res.error && res.error.message) {
           this.globalService.showMsgSnackBar(res.error);
           // this.closeRatingPopup();
 
 
         }
       });
     // 🔹 API call example
     // this.apiService.post('rate-us', payload).subscribe()
 
   }
     setRating(value: number): void {
    this.rateUsForm.patchValue({ rating: value });
  }
}
