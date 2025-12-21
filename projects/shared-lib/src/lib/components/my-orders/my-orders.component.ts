import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, inject, OnInit, ViewChild } from '@angular/core';
import { catchError, of } from 'rxjs';
import { DataService } from '../../services/data-service';
declare var bootstrap: any;

@Component({
  selector: 'app-my-orders',
  templateUrl: './my-orders.component.html',
  imports:[CommonModule],
  styleUrls: ['./my-orders.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MyOrdersComponent implements OnInit {
  @ViewChild('deleteorder') deleteorder!: ElementRef;
 dataService = inject(DataService);
 private cd = inject(ChangeDetectorRef)
  orderListData: any=[];
  orderId: any;
  constructor() { }

  ngOnInit() {
    console.log('enter');
    
this.orderList();
  }

  deleteMyOrder(id:any){
   this.orderId = id;
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

deleteOrder(){
 this.dataService.delete('wishlist',this.orderId).subscribe((res:any)=>{
    let response = {
        message:'Item Removed from Wish List',
        success:true
    }
    const modal = bootstrap.Modal.getInstance(
        this.deleteorder.nativeElement
      );
      modal.hide();
      this.orderList();
      this.cd.markForCheck();
}
 )
}
}
