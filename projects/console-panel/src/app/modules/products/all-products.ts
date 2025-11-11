import { Component, inject } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';

import { ActivatedRoute, Router } from '@angular/router';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { DataService } from 'shared-lib';
import {Sidebar} from "../../layout/sidebar/sidebar";
import {Header} from "../../layout/header/header";
@Component({
  selector: 'app-all-products',
  imports: [Sidebar, Header],
  templateUrl: './all-products.html',
  styleUrl: './all-products.scss'
})








export class AllProducts {

  public dataService:any= inject(DataService);
  private activatedRoute= inject(ActivatedRoute);
  public router=inject(Router)
 //add toastr library private activatedRoute= inject(ActivatedRoute);
  email:any='superadmin@demohandler.com'
  password:any='R9!hQ7k$2Pm@A1eZx4LwT8uV#cN0sBf'

  constructor() {
  this.callAllProductList()
  }
  callAllProductList() {

    const payload = {
      email: this.email,
      password: this.password
    };

    
    this.dataService.callApi(payload, 'login').pipe(
      catchError((error) => {
        console.error('Error occurred during login:', error);
       //add toaserfnc alert('Login failed: ' + response.message);
        // Optionally, you can return an observable to prevent further execution
        return of(null); // or you can return a default value if needed
      })
    ).subscribe((response: any) => {
      console.log('Response:', response);
    
      if (response && response.success) {
      
      } else if (response) {
       //add toaserfnc alert('Login failed: ' + response.message);
      }
    });
    
  }

}