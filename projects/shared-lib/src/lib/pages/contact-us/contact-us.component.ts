import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import {DataService} from '../../services/data-service';
import {GlobaCommonlService} from '../../services/global-common.service';

import { catchError, of } from 'rxjs';

@Component({
  selector: 'web-contact-us',
  imports: [CommonModule,ReactiveFormsModule],
  templateUrl: './contact-us.component.html',
  styleUrl: './contact-us.component.scss'
})
export class ContactUs implements OnInit {
  contactForm!: FormGroup;
  dataService  = inject(DataService);
  globalCommonService = inject(GlobaCommonlService)
  cd = inject(ChangeDetectorRef);
  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.contactForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      subject: ['', Validators.required],
      message: ['', Validators.required],
    });
  }

  onSubmit(): void {
    if (this.contactForm.invalid) {
      this.contactForm.markAllAsTouched();
      return;
    }
this.dataService.post(this.contactForm.value,'contact-us').pipe(
        catchError((err) => {
          return of(err);
        }),
      )
      .subscribe((res: any) => {
    console.log(this.contactForm.value);
       if (res?.success == true) {
          this.globalCommonService.showMsgSnackBar(res);
          this.contactForm.reset();
          this.cd.detectChanges();
       }
       else if(res.success == false){
          this.globalCommonService.showMsgSnackBar(res);
       }
      })
    // API call yaha se kar sakte ho
  }

  // getters (clean HTML ke liye)
 get name() { return this.contactForm.get('name');}

get email() {return this.contactForm.get('email');}

get subject() { return this.contactForm.get('subject');}

get message() {return this.contactForm.get('message');}

}
