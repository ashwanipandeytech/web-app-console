import { Inject, NgModule, PLATFORM_ID } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Category } from './category';
import { Sidebar } from '../../layout/sidebar/sidebar';
import { Header } from '../../layout/header/header';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
@NgModule({
  declarations: [Category],
  // declarations: [MyphotosComponent],

 imports: [Sidebar, Header, ReactiveFormsModule, CommonModule, FormsModule],
})
export class CategoryModule {

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}
 }
