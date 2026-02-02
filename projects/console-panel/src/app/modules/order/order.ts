import { Component, ChangeDetectorRef, inject, ViewChild, TemplateRef } from '@angular/core';
import { DatePipe } from '@angular/common';
import { DataService } from '../../../../../shared-lib/src/lib/services/data-service';
import { catchError, of } from 'rxjs';
import { environment } from 'environments/environment';

import { Sidebar } from '../../layout/sidebar/sidebar';
import { Header } from '../../layout/header/header';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-order',
  imports: [Sidebar, Header, DatePipe, ReactiveFormsModule],
  templateUrl: './order.html',
  styleUrl: './order.scss',
})
export class Order {
  @ViewChild('editOrderModal') editOrderModal!: TemplateRef<any>;
  orderForm!: FormGroup;
  selectedOrder: any;
  public dataService: any = inject(DataService);
  private modalService = inject(NgbModal);
  private fb = inject(FormBuilder);
  orderListData: any = [];
  defaultPage = 1;
  constructor(private cd: ChangeDetectorRef) {
    this.createForm();
    this.getOrderList();
  }

  createForm() {
    this.orderForm = this.fb.group({
      customer: ['', Validators.required],
      status: ['', Validators.required],
      product: ['', Validators.required],
      price: ['', Validators.required],
      payment_method: ['', Validators.required],
    });
  }

  openEditModal(order: any) {
    this.selectedOrder = order;

    this.orderForm.patchValue({
      customer: order.customer,
      status: order.status,
      product: order.product,
      price: order.price,
      payment_method: order.payment_method,
    });

    this.modalService.open(this.editOrderModal, {
      centered: true,
      size: 'lg',
      backdrop: 'static',
    });
  }
 nextPage(page:any){
// this.defaultPage = page;
this.getOrderList();
  }

  submit(modal: any) {
    if (this.orderForm.invalid) return;

    const payload = {
      ...this.selectedOrder,
      ...this.orderForm.value,
    };

    // console.log('Updated Order:', payload);

    // 🔥 call update API here
    // this.orderService.updateOrder(payload).subscribe()

    modal.close();
  }
  
  getOrderList() {
    this.orderListData = [];
    
    this.dataService
      .get(`orders?page=${this.defaultPage}`)
      .pipe(
        catchError((err) => {
          console.error('Error:', err);
          return of(null);
        })
      )
      .subscribe((res: any) => {
        this.orderListData = res.data;
        console.log('this.orderListData===>',this.orderListData);
        
        this.cd.detectChanges();
      });
  }
}
