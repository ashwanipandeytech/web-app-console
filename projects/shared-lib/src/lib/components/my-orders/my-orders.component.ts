import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { catchError, of } from 'rxjs';
import { DataService } from '../../services/data-service';

@Component({
  selector: 'app-my-orders',
  templateUrl: './my-orders.component.html',
  imports:[CommonModule],
  styleUrls: ['./my-orders.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MyOrdersComponent implements OnInit {
 dataService = inject(DataService);
 private cd = inject(ChangeDetectorRef)
  orderListData: any=[];
  constructor() { }

  ngOnInit() {
    console.log('enter');
    
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
                    this.cd.detectChanges();
                    // this.router.navigate(['/cart']);
                  }
                });
}
}
