
import { ChangeDetectorRef, Component, effect, inject } from '@angular/core';
import { Router, RouterLink, RouterModule } from '@angular/router';
import { DataService } from '../../../../../shared-lib/src/lib/services/data-service';
import { catchError, of } from 'rxjs';
import { GlobalFunctionService } from 'shared-lib/services/global-function.service';
import { SignalService } from 'projects/signal-service';

@Component({
  selector: 'web-header',
  imports: [RouterLink,RouterModule],
  templateUrl: './header.html',
  styleUrl: './header.scss'
})
export class Header {
  private route = inject(Router);
  readonly dataService=inject(DataService);
  private globalFunctionService = inject(GlobalFunctionService);
   private signalService =inject(SignalService);
isLoggedIn:any= false;
  cartItemCount: any=0;
  userName: any;
  categoryListData: any;
  countsList: any;
constructor(private cd:ChangeDetectorRef){
    this.globalFunctionService.getCount();
  effect(() => {
  // console.log('Cart count changed:', this.signalService.cartCounts());
  if(this.signalService.allCounts() !=null){

    this.countsList = this.signalService.allCounts();
    this.cd.detectChanges();
  }
});
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
    // this.carList();
    this.getCategoryList();
    // this.getCartCount();
    // this.globalFunctionService.cartCount$.subscribe(data => {
    // if (data) {
      // let countss = this.signalService.cartCounts;
      // this.countsList = countss();
      // console.log('this.countsList===>',this.countsList);
      
  //   }
  // });

  }
  
    gotoCategory(id:any){
this.route.navigate(['/category-details',id]);
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
    this.dataService.get('categories/menu')
    .pipe(
      catchError(err => {
        console.error('Error:', err);
        return of(null);
      })
    )
    .subscribe((res: any) => {
      if (res.data) {
// console.log('this.categoryListData===>',res.data);
       this.categoryListData = res.data;
        // for (let i = 0; i < res.data.length; i++) {
        //   const element = res.data[i];
        //   // if (element?.thumbnail != null) {
        //   //   element.thumbnail = environment.DOMAIN + '/' + element.thumbnail;
        //   // }
        //   this.categoryListData.push(element);
        // }
      }
      this.cd.detectChanges();
      // this.categoryListData = res.data;
    });
  }
    logout() {
    localStorage.clear();
    
    this.route.navigate(['/']).then(() => {
      window.location.reload();
    });
    // window.location.reload();
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
    
  //   getCartCount(){
  //     this.dataService.get('user/overview-counts').subscribe((res:any)=>{
  //       console.log('res====>',res);
  //       this.countsList = res.data;
  //     })
  //   // this.dataService.get((data)=>{ 
  //   //   this.arrCartLength = data
  //   //   this.cdr.detectChanges();
  //   // });
  // }
}
