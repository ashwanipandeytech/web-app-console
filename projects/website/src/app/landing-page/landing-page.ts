import { HttpClientModule } from '@angular/common/http';
import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { catchError, of } from 'rxjs';
import { DataService } from 'shared-lib';
import { environment } from 'environments/environment';

@Component({
  selector: 'web-landing-page',
  templateUrl: './landing-page.html',
  styleUrl: './landing-page.scss',
  standalone:false,
})
export class LandingPage {
 public dataService:any= inject(DataService);
  productListData: any=[];
  baseURL: string;

 constructor(private cd:ChangeDetectorRef){
this.callAllProductList();
this.baseURL=environment.DOMAIN;
 }
   callAllProductList() {

    // const payload = {
    //   email: this.email,
    //   password: this.password
    // };

    
    this.dataService.callGetApi('products/search','web').pipe(
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

}

