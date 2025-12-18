import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { catchError, of } from 'rxjs';
import { DataService } from '../../services/data-service';
import { GlobalFunctionService } from '../../services/global-function.service';

@Component({
  selector: 'app-address-section',
  templateUrl: './address-section.component.html',
  imports:[FormsModule],
  styleUrls: ['./address-section.component.scss']
})
export class AddressSectionComponent implements OnInit {
  addressListData: any=[];
private dataService = inject(DataService);
public globalFunctionService = inject(GlobalFunctionService);
private cd = inject(ChangeDetectorRef);
  currentUser: any;
  constructor() { }

  ngOnInit() {
    this.getAddressList();
     this.currentUser = JSON.parse(localStorage.getItem('user') || 'null');
  }

   getAddressList(){
         this.dataService.get('addresses').pipe(
        catchError((error) => {
          return of(null);
        })
      ).subscribe((response: any) => {
        if (response.success == true) {
          this.addressListData = response.data;
          console.log('this.addressListData==>',this.addressListData);  
          this.cd.detectChanges();
        }
      })
    }
}
