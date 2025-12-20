
import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { DataService } from '../../../../../shared-lib/src/lib/services/data-service';
import { catchError, of } from 'rxjs';

@Component({
  selector: 'web-header',
  imports: [],
  templateUrl: './header.html',
  styleUrl: './header.scss'
})
export class Header {
  private route = inject(Router);
  readonly dataService=inject(DataService);
isLoggedIn:any= false;
  cartItemCount: any=0;
  userName: any;
  categoryListData: any;
constructor(private cd:ChangeDetectorRef){

  //use effect for getting the userState signal

  //step1 if user is found logged in 
  //call carlist api to show the cart list count
  //call wishlist api to show the wishlist count


  //use effect for getting the CART ADDED signal
  //call carlist api to show the cart list count

}
  ngOnInit(){
      let userData:any = localStorage.getItem('user');
    if (userData == null) {
      this.isLoggedIn = false;
    }
    else{
      this.isLoggedIn = true;
      this.userName = JSON.parse(userData).user.name;
      
    }
    this.carList();
    this.getCategoryList();
  }
    gotoCategory(id:any){
this.route.navigate(['/product-sidebar',id]);
  }
  openDashboard(){
    if (this.isLoggedIn) {
      this.route.navigate(['/user-profile.html'])
    }
    else{
      this.route.navigate(['/login'])
    }
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
      if (res.data) {

        for (let i = 0; i < res.data.length; i++) {
          const element = res.data[i];
          // if (element?.thumbnail != null) {
          //   element.thumbnail = environment.DOMAIN + '/' + element.thumbnail;
          // }
          this.categoryListData.push(element);
        }
      }
      this.cd.detectChanges();
      // this.categoryListData = res.data;
    });
  }
  carList(){
       this.dataService.get('cart').pipe(
        catchError((error) => {
          return of(null); // or you can return a default value if needed
        })
      ).subscribe((response: any) => {
  console.log('response==>',response);
  if (response.success == true) {
    this.cartItemCount = response.data.data.length;
    this.cd.detectChanges();
  }
  
      })
    }
}
