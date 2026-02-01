import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';

import { ActivatedRoute, Router } from '@angular/router';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { DataService } from 'shared-lib';
import { Sidebar } from '../../layout/sidebar/sidebar';
import { Header } from '../../layout/header/header';
import { ConfirmationPopupComponent } from '../../confirmationPopup/confirmationPopup.component';
import { MatDialog } from '@angular/material/dialog';
import { GlobalService } from '../../global.service';
import { AddProduct } from './add-product/add-product';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { environment } from 'shared-lib/environments/environment';
@Component({
  selector: 'app-all-products',
  imports: [],
  templateUrl: './all-products.html',
  styleUrl: './all-products.scss',
})
export class AllProducts {
  public dataService: any = inject(DataService);
  private activatedRoute = inject(ActivatedRoute);
  readonly dialog = inject(MatDialog);
  readonly ngbModal = inject(NgbModal);
  public router = inject(Router);
  //add toastr library private activatedRoute= inject(ActivatedRoute);
  email: any = 'superadmin@demohandler.com';
  password: any = 'R9!hQ7k$2Pm@A1eZx4LwT8uV#cN0sBf';
  productListData: any = [];
  defaultPage = 1;
  constructor(
    private cd: ChangeDetectorRef,
    private globalService: GlobalService,
  ) {
    this.callAllProductList();
  }
  callAllProductList() {
    this.productListData = [];
    const payload = {
      email: this.email,
      password: this.password,
    };
    this.dataService
      .get(`products?page=${this.defaultPage}`)
      .pipe(
        catchError((error) => {
          console.error('Error occurred during login:', error);
          //add toaserfnc alert('Login failed: ' + response.message);
          // Optionally, you can return an observable to prevent further execution
          return of(null); // or you can return a default value if needed
        }),
      )
      .subscribe((response: any) => {
        //console.log('Response:', response);
        this.productListData = response.data;
        this.cd.detectChanges();
        if (response && response.success) {
        } else if (response) {
          //add toaserfnc alert('Login failed: ' + response.message);
        }
      });
  }
  nextPage(page: any) {
    this.defaultPage = page;
    this.callAllProductList();
  }
  openAddProductModal(action: any) {
    const dialogRef: NgbModalRef = this.ngbModal.open(AddProduct, {
      windowClass: 'mobile-modal product-edit-popup',
      scrollable: true,
      centered: true,
      size: 'xl',
      backdrop: 'static', // optional
    });
    dialogRef.componentInstance.data = action;
  }
  editoProduct(item: any) {
    console.log('item==>', item);

    const dialogRef: NgbModalRef = this.ngbModal.open(AddProduct, {
      windowClass: 'mobile-modal product-edit-popup',
      scrollable: true,
      centered: true,
      size: 'xl',
      backdrop: 'static', // optional
    });
    dialogRef.componentInstance.data = item;

    dialogRef.result
      .then((result) => {
        console.log('Modal closed with result:', result);
        if (result == 'success') {
          this.callAllProductList();
        }
      })
      .catch((reason) => {
        //console.log('Modal dismissed:', reason);
      });
  }

  openDialog(id: any): void {
    let popupData = {
      title: 'Product',
      description: 'Are you sure, you want to delete Product',
      id: id,
    };
    let dialogRef = this.dialog.open(ConfirmationPopupComponent, {
      width: '250px',
      data: popupData,
    });
    dialogRef.afterClosed().subscribe((result) => {
      //console.log('Dialog closed with:', result);

      if (result.action === 'delete') {
        // Perform delete
        this.deleteProduct(result.id);
      }
    });
  }
  previewProduct(id: any) {
    let url = `${environment.WEB_URL}/product-details/${id}?preview=1`;
    window.open(url, '_blank');
  }
  deleteProduct(id: any) {
    this.dataService
      .delete(`products/${id}`)
      .pipe(
        catchError((err) => {
          console.error('Error:', err);
          setTimeout(() => {
            this.globalService.showMsgSnackBar(err);
          }, 100);
          return of(null);
        }),
      )

      .subscribe((res: any) => {
        //console.log('Response:', res);
        this.callAllProductList();
        setTimeout(() => {
          this.globalService.showMsgSnackBar(res);
        }, 100);
        this.cd.detectChanges();
        // this.categoryListData = res.data;
      });
  }
}
