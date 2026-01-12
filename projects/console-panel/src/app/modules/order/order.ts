import { Component, ChangeDetectorRef, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { DataService } from '../../../../../shared-lib/src/lib/services/data-service';
import { catchError, of } from 'rxjs';
import { environment } from 'environments/environment';

import {Sidebar} from "../../layout/sidebar/sidebar";
import {Header} from "../../layout/header/header";

@Component({
  selector: 'app-order',
  imports: [Sidebar, Header, DatePipe],
  templateUrl: './order.html',
  styleUrl: './order.scss',
})
export class Order {
  public dataService: any = inject(DataService);

  orderListData: any = [];

  constructor(private cd: ChangeDetectorRef){
    this.getCategoryList();
  }

  getCategoryList() {
    this.orderListData = [];
    this.dataService
      .get('orders')
      .pipe(
        catchError((err) => {
          console.error('Error:', err);
          return of(null);
        })
      )
      .subscribe((res: any) => {
        console.log('Response:', res);

        this.orderListData = res.data.data;
        this.cd.detectChanges();

       
        //console.log('categoryListData==>', this.categoryListData);

        // this.categoryListData = res.data;
      });
  }
}
