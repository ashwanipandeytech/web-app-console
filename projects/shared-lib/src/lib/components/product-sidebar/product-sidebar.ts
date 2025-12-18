import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { catchError, of } from 'rxjs';
import { DataService } from '../../services/data-service';
import { GlobaCommonlService } from 'projects/global-common.service';

@Component({
  selector: 'web-product-sidebar',
  imports: [],
  templateUrl: './product-sidebar.html',
  styleUrl: './product-sidebar.scss'
})
export class ProductSidebarCommon {
  public dataService:any= inject(DataService);
  productListData: any=[];
  categoryListData: any;
  public globalService:any= inject(GlobaCommonlService);

  constructor(private cd:ChangeDetectorRef, private router: Router) {
    this.callAllProductList();
    this.getCategoryList();
  }

  openProduct(id: number) {
    this.router.navigate(['/product-details', id]);
  }

  callAllProductList() {

    // const payload = {
    //   email: this.email,
    //   password: this.password
    // };

    
    this.dataService.get('products/search','web').pipe(
      catchError((error) => {
        // console.error('Error occurred during login:', error);
       //add toaserfnc alert('Login failed: ' + response.message);
        // Optionally, you can return an observable to prevent further execution
        return of(null); // or you can return a default value if needed
      })
    ).subscribe((response: any) => {
      // console.log('Response:', response);
    this.productListData = response.data.data;
    this.cd.detectChanges();
      if (response && response.success) {
      
      } else if (response) {
       //add toaserfnc alert('Login failed: ' + response.message);
      }
    });
    
  }

  getCategoryList() {
    this.categoryListData = [];
    this.dataService.get('categories')
      .pipe(
        catchError(err => {
          console.error('Error:', err);
          return of(null);
        })
      )
      .subscribe((res: any) => {
        console.log('Response:', res);
        if (res.data) {

          for (let i = 0; i < res.data.length; i++) {
            const element = res.data[i];
            console.log('element==>', element.thumbnail);
            if (element?.thumbnail != null) {
              console.log('environment.API_URL==>', environment.API_URL);
              element.thumbnail = environment.DOMAIN + '/' + element.thumbnail;
            }
            this.categoryListData.push(element);
          }
        }
        console.log('categoryListData==>', this.categoryListData);

        this.cd.detectChanges();
        // this.categoryListData = res.data;
      });
  }

  back(){
    window.history.back();
  }

  addToCart(data: any) {
    let finalData = {
      product_id: data.id,
      quantity: '1',
    };
    // console.log('finalData==.',finalData);
    // return;
    this.dataService
      .post(finalData, 'cart')
      .pipe(
        catchError((err) => {
          return of(err);
        })
      )
      .subscribe((res: any) => {
        // console.log('Response:', res);
        // console.log('🧩 x-cart-identifier:', res.headers.get('x-cart-identifier'));
        let nonLoggedInUserToken = res.headers.get('x-cart-identifier');
        if (nonLoggedInUserToken) {
          localStorage.setItem('isNonUser', JSON.stringify(nonLoggedInUserToken));
        }
        if (res.success == true) {
          this.globalService.showMsgSnackBar(res);
        } else if (res.error && res.error.message) {
          this.globalService.showMsgSnackBar(res.error);
        }
      });
  }


}
