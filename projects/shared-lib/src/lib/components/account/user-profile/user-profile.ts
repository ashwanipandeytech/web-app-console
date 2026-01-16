import { ChangeDetectorRef, Component, effect, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PersonalDetailsComponent } from 'shared-lib/components/personal-details/personal-details.component';
import { AddressSectionComponent } from 'shared-lib/components/address-section/address-section.component';
import { MyOrdersComponent } from 'shared-lib/components/my-orders/my-orders.component';
import { ChangePasswordComponent } from 'shared-lib/components/change-password/change-password.component';
import { CommonModule } from '@angular/common';
import { Wishlist } from '../wishlist/wishlist';
import { SignalService } from '../../../services/signal-service';

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
  private activatedRoute = inject(ActivatedRoute);
  public signalService: any = inject(SignalService);
  isLoggedIn: any = null;
  ispersonalInfo: boolean = true;
  isOrder: boolean = false;
  isWishlist: boolean = false;
  changePassword: boolean = false;
  isAddress: boolean = false;
  activePage: any;

  constructor() {

  }
  ngOnInit() {
    let userData = localStorage.getItem('user');
    if (userData == null) {
      this.isLoggedIn = false;
    } else {
      this.isLoggedIn = true;
    }
    this.activatedRoute.queryParams.subscribe(params => {
      //console.log(params['key']);
      if (params['key']) {
        this.activePage = params['key'];
        //console.log("this.activePage", this.activePage)

        this.openComponent(this.activePage);
      }
    });

  }
  logout() {
    localStorage.clear();

    this.route.navigate(['/']).then(() => {
      window.location.reload();
    });
    // window.location.reload();
  }
  openComponent(component: any) {
    //console.log('component==>',component);
    this.activePage = component;
    this.route.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: { key: component },
      queryParamsHandling: 'merge' // keeps existing params
    });
    if (component == 'account') {
      this.ispersonalInfo = true;
      this.isOrder = false;
      this.isWishlist = false;
      this.changePassword = false;
      this.isAddress = false;
    }
    if (component == 'Orders') {
      this.ispersonalInfo = false;
      this.isOrder = true;
      this.isWishlist = false;
      this.changePassword = false;
      this.isAddress = false;
    }
    if (component == 'wishlist') {
      this.ispersonalInfo = false;
      this.isOrder = false;
      this.isWishlist = true;
      this.changePassword = false;
      this.isAddress = false;
    }
    if (component == 'Change-Password') {
      this.ispersonalInfo = false;
      this.isOrder = false;
      this.isWishlist = false;
      this.changePassword = true;
      this.isAddress = false;
    }
    if (component == 'address') {
      this.ispersonalInfo = false;
      this.isOrder = false;
      this.isWishlist = false;
      this.changePassword = false;
      this.isAddress = true;
    }
    let isLoggedIn = JSON.parse(localStorage.getItem('isLoggedIn') || 'null');

    if (!isLoggedIn) {

     
      this.signalService.openLoginPopup.set(true);
      this.signalService.openLoginTrigger.update((v: number) => v + 1);
      return;

    } else {
      this.signalService.openLoginPopup.set(false)
    }
    this.cd.detectChanges();
  }
}
