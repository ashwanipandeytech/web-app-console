import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { catchError, of } from 'rxjs';
import { DataService } from 'shared-lib/services/data-service';

@Component({
  selector: 'app-coupons',
  templateUrl: './coupons.component.html',
  imports:[CommonModule,ReactiveFormsModule],
  styleUrls: ['./coupons.component.scss']
})
export class CouponsComponent implements OnInit {
discountForm!:FormGroup;
fb= inject(FormBuilder);
dataService = inject(DataService)
  constructor() { }

  ngOnInit() {
    this.couponForm();
  }
couponForm(){
   this.discountForm = this.fb.group({
      code: ['', Validators.required],
      type: ['single', Validators.required],
      discount_amount: [null, [Validators.required, Validators.min(1)]],
      discount_type: ['percentage', Validators.required],
      min_cart_value: [null],
      max_usage: [null],
      usage_per_user: [1],
      valid_from: ['', Validators.required],
      valid_to: ['', Validators.required],
      is_active: [true],
      applicable_to: [null]
    });
}
submit() {
    console.log(this.discountForm.value);
 this.dataService
      .post(this.discountForm.value, 'coupons')
      .pipe(
        catchError((err) => {
          console.error('Error:', err);
          return of(null);
        })
      )
      .subscribe((res: any) => {
        if (res.success == true) {
        }
      })
    // if (this.discountForm.invalid) {
    //   this.discountForm.markAllAsTouched();
    //   return;
    // }

  }
}
