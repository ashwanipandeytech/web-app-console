import { Inject, NgModule, PLATFORM_ID } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ConfirmationPopupComponent } from './confirmationPopup/confirmationPopup.component';
import { MatButtonModule } from '@angular/material/button';
@NgModule({
  declarations: [],
  // declarations: [MyphotosComponent],

 imports: [ ReactiveFormsModule, CommonModule, FormsModule,MatButtonModule],
})
export class CategoryModule {

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}
 }
