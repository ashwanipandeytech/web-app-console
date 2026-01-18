import { Inject, NgModule, PLATFORM_ID } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ConfirmationPopupComponent } from './confirmationPopup/confirmationPopup.component';
import { MatButtonModule } from '@angular/material/button';
import { CategoryTreeComponent } from './modules/products/add-product/category-tree/category-tree.component';
import { MatIconModule } from '@angular/material/icon';
@NgModule({
  declarations: [],
  // declarations: [MyphotosComponent],
 imports: [ ReactiveFormsModule, CommonModule, FormsModule,MatButtonModule,MatIconModule],
})
export class SharedModule {

  constructor() {}
 }
