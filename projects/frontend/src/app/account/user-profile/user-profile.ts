import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { PersonalDetailsComponent } from 'shared-lib/components/personal-details/personal-details.component';
import { AddressSectionComponent } from 'shared-lib/components/address-section/address-section.component';
import { MyOrdersComponent } from 'shared-lib/components/my-orders/my-orders.component';
import { ChangePasswordComponent } from 'shared-lib/components/change-password/change-password.component';
import { CommonModule } from '@angular/common';
import { Wishlist } from '../wishlist/wishlist';

@Component({
  selector: 'web-user-profile',
  imports: [
    PersonalDetailsComponent,
    AddressSectionComponent,
    MyOrdersComponent,
    ChangePasswordComponent,
    Wishlist,
    CommonModule
  ],
  templateUrl: './user-profile.html',
  styleUrl: './user-profile.scss',
})
export class UserProfile {
  private route = inject(Router);
  private cd = inject(ChangeDetectorRef);
  isLoggedIn: any = null;
  ispersonalInfo: boolean=true;
  isOrder: boolean=false;
  isWishlist: boolean=false;
  changePassword: boolean=false;
  isAddress: boolean=false;

  constructor() {}
  ngOnInit() {
    let userData = localStorage.getItem('user');
    if (userData == null) {
      this.isLoggedIn = false;
    } else {
      this.isLoggedIn = true;
    }
  }
  logout() {
    localStorage.clear();
    this.route.navigate(['/']).then(() => {
      window.location.reload();
    });
    // window.location.reload();
  }
  openComponent(component:any){
    console.log('component==>',component);
    
if (component == 'Personal_Info') {
  this.ispersonalInfo = true;
   this.isOrder = false;
   this.isWishlist = false;
   this.changePassword = false;
   this.isAddress = false;
}
if (component == 'Order') {
  this.ispersonalInfo = false;
   this.isOrder = true;
   this.isWishlist = false;
   this.changePassword = false;
   this.isAddress = false;
}
if (component == 'Wishlist') {
   this.ispersonalInfo = false;
   this.isOrder = false;
   this.isWishlist = true;
   this.changePassword = false;
   this.isAddress = false;
}
if (component == 'Change_Password') {
   this.ispersonalInfo = false;
   this.isOrder = false;
   this.isWishlist = false;
   this.changePassword = true;
   this.isAddress = false;
}
if (component == 'Address') {
  this.ispersonalInfo = false;
   this.isOrder = false;
   this.isWishlist = false;
   this.changePassword = false;
   this.isAddress = true;
}
this.cd.detectChanges();
  }
}
