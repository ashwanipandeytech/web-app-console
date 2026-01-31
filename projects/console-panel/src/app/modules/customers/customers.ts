import { ChangeDetectorRef, Component, inject } from '@angular/core';
import {Sidebar} from "../../layout/sidebar/sidebar";
import {Header} from "../../layout/header/header";
import { DataService } from 'shared-lib/services/data-service';
import { catchError, of } from 'rxjs';
import { GlobalService } from '../../global.service';

@Component({
  selector: 'app-customers',
  imports: [Sidebar, Header],
  templateUrl: './customers.html',
  styleUrl: './customers.scss'
})

export class Customers {
  private dataService = inject(DataService);
  private cd=inject(ChangeDetectorRef);
  globalService = inject(GlobalService);
  customerList: any=[];
constructor(){

}
ngOnInit(){
this.getCustomerList();
 
}
getCustomerList(){
  this.dataService.get('users?per_page=5').pipe(
          catchError((err) => {
            console.error('Error:', err);
            return of(err);
          })
        )
        .subscribe((res: any) => {
          let filteredData = [];
          console.log('Response:', res);
          if (res?.data) {
            this.customerList = res.data.data;
            this.cd.detectChanges();
          }
          if (res.error) {
          this.globalService.showMsgSnackBar(res.error);
          return;
          }
        })
      }
}
