
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
constructor(private cd:ChangeDetectorRef){

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
  }
  openDashboard(){
    if (this.isLoggedIn) {
      this.route.navigate(['/user-profile.html'])
    }
    else{
      this.route.navigate(['/login'])
    }
  }


  carList(){
       this.dataService.callGetApi('cart').pipe(
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
