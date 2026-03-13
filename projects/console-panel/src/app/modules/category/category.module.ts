import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Category } from './category';
import { Sidebar } from '../../layout/sidebar/sidebar';
import { Header } from '../../layout/header/header';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@NgModule({
  imports: [Category, Sidebar, Header, ReactiveFormsModule, CommonModule, FormsModule],
})
export class CategoryModule {
  constructor() {}
}
