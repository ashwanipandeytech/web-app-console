import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';

import { ActivatedRoute, Router } from '@angular/router';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { DataService } from 'shared-lib';
import {Sidebar} from "../../layout/sidebar/sidebar";
import {Header} from "../../layout/header/header";
import { ConfirmationPopupComponent } from '../../confirmationPopup/confirmationPopup.component';
import { MatDialog } from '@angular/material/dialog';
import { GlobalService } from '../../global.service';
@Component({
  selector: 'app-all-products',
  imports: [],
  templateUrl: './all-products.html',
  styleUrl: './all-products.scss'
})



export class AllProducts {

  public dataService:any= inject(DataService);
  private activatedRoute= inject(ActivatedRoute);
  readonly dialog = inject(MatDialog);
  public router=inject(Router)
 //add toastr library private activatedRoute= inject(ActivatedRoute);
  email:any='superadmin@demohandler.com'
  password:any='R9!hQ7k$2Pm@A1eZx4LwT8uV#cN0sBf'
  productListData: any=[];

  constructor(private cd:ChangeDetectorRef,private globalService:GlobalService) {
  this.callAllProductList()
  }
  callAllProductList() {

    const payload = {
      email: this.email,
      password: this.password
    };

    
    this.dataService.get('products').pipe(
      catchError((error) => {
        console.error('Error occurred during login:', error);
       //add toaserfnc alert('Login failed: ' + response.message);
        // Optionally, you can return an observable to prevent further execution
        return of(null); // or you can return a default value if needed
      })
    ).subscribe((response: any) => {
      console.log('Response:', response);
    this.productListData = response.data.data;
    this.cd.detectChanges();
      if (response && response.success) {
      
      } else if (response) {
       //add toaserfnc alert('Login failed: ' + response.message);
      }
    });
    
  }


    openDialog(id: any): void {
      let popupData = {
        title: 'Product',
        description: 'Are you sure, you want to delete Product',
        id: id
      }
      let dialogRef = this.dialog.open(ConfirmationPopupComponent, {
        width: '250px',
        data: popupData,
      });
      dialogRef.afterClosed().subscribe(result => {
        console.log('Dialog closed with:', result);
  
        if (result.action === 'delete') {
          // Perform delete
          this.deleteProduct(result.id);
  
        }
      })
    }
      deleteProduct(id: any) {
    this.dataService.delete('products', id)
      .pipe(
        catchError(err => {
          console.error('Error:', err);
           setTimeout(() => {
          this.globalService.showMsgSnackBar(err);
        }, 100);
          return of(null);
        })
      )
      
      .subscribe((res: any) => {
        console.log('Response:', res);
        this.callAllProductList();
          setTimeout(() => {
          this.globalService.showMsgSnackBar(res);
        }, 100);
        this.cd.detectChanges();
        // this.categoryListData = res.data;
      });
  }

}