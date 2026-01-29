import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { catchError, of } from 'rxjs';
import { DataService } from 'shared-lib/services/data-service';

@Component({
  selector: 'app-customer-reports',
  imports:[CommonModule],
  templateUrl: './customer-reports.component.html',
  styleUrls: ['./customer-reports.component.scss']
})
export class CustomerReportsComponent implements OnInit {
  dataService  = inject(DataService);
  cd = inject(ChangeDetectorRef);
  contactsList: any=[];
  constructor() { }

  ngOnInit() {
this.getCustomerReports();
  }

getCustomerReports(){
   this.dataService.get('contacts').pipe(
      catchError((error) => {
        return of(error);
      })
    ).subscribe((response: any) => {
      console.log('Response:', response);
    this.contactsList = response.data;
    this.contactsList.data.map((item:any)=>{
      item.showFullMessage = false
    })
    this.cd.detectChanges();
    })
}
toggleMessage(item: any): void {
    item.showFullMessage = !item.showFullMessage;
  }
}
