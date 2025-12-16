import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { catchError, of } from 'rxjs';
import { DataService } from '../../services/data-service';

@Component({
  selector: 'app-my-orders',
  templateUrl: './my-orders.component.html',
  imports:[CommonModule],
  styleUrls: ['./my-orders.component.scss']
})
export class MyOrdersComponent implements OnInit {
 dataService = inject(DataService);
  orderListData: any=[];
  constructor() { }

  ngOnInit() {
this.orderList();
  }
orderList(){
 this.dataService.get('orders')
          .pipe(
            catchError(err => {
                    return of(null);
                  })
                )
                .subscribe((res: any) => {
                  console.log('Response:===>', res);
                  if (res.success == true) {   

                    this.orderListData = res.data.data;
                    // this.router.navigate(['/cart']);
                  }
                });
}
}
