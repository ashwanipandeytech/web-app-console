import { ChangeDetectorRef, Component, ElementRef, inject, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { catchError, of } from 'rxjs';
import { DataService } from '../../services/data-service';
import { GlobalFunctionService } from '../../services/global-function.service';
import { GlobaCommonlService } from '../../services/global-common.service';
import { CommonModule } from '@angular/common';
import { NoDataComponent } from '../no-data/no-data.component';
declare var bootstrap: any;

@Component({
  selector: 'app-address-section',
  templateUrl: './address-section.component.html',
  imports:[FormsModule,CommonModule,NoDataComponent],
  styleUrls: ['./address-section.component.scss']
})
export class AddressSectionComponent implements OnInit {
  @ViewChild('removeAddressModal') removeAddressModal!: ElementRef;

  addressListData: any=[];
private dataService = inject(DataService);
public globalFunctionService = inject(GlobalFunctionService);
private globalService = inject(GlobaCommonlService);
private cd = inject(ChangeDetectorRef);
  currentUser: any;
  deleteAddressId: any;
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
    setDeleteId(id: any) {
  this.deleteAddressId = id;
}
deleteAddress() {
  console.log('Deleting ID:', this.deleteAddressId);

  this.dataService.delete('addresses',this.deleteAddressId).subscribe((res:any) => {
    // uncomment below 
    // if (res.success) {
      // this.globalService.showMsgSnackBar(res);
      this.getAddressList();
    const modal = bootstrap.Modal.getInstance(
        this.removeAddressModal.nativeElement
      );
      modal.hide();
    // }
 
  });
}

editAddress(item:any){

}
}
