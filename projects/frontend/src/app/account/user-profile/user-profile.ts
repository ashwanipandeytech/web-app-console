import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { PersonalDetailsComponent } from 'shared-lib/components/personal-details/personal-details.component';
import { AddressSectionComponent } from 'shared-lib/components/address-section/address-section.component';
import { MyOrdersComponent } from 'shared-lib/components/my-orders/my-orders.component';
import { ChangePasswordComponent } from 'shared-lib/components/change-password/change-password.component';


@Component({
  selector: 'web-user-profile',
  imports: [PersonalDetailsComponent,AddressSectionComponent,MyOrdersComponent,ChangePasswordComponent],
  templateUrl: './user-profile.html',
  styleUrl: './user-profile.scss'
})
export class UserProfile {
  private route = inject(Router);
isLoggedIn:any=null;
constructor(){

}
  ngOnInit(){
    let userData = localStorage.getItem('user');
    if (userData == null) {
      this.isLoggedIn = false;
    }
    else{
      this.isLoggedIn = true;
    }
    
  }
  logout(){
    localStorage.clear();
    this.route.navigate(['/']).then(()=>{
      window.location.reload();
    })
    // window.location.reload();
  }
}
