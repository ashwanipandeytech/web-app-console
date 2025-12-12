import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { PersonalDetailsComponent } from '../../../../../shared-lib/src/lib/components/personal-details/personal-details.component';
import { AddressSectionComponent } from '../../../../../shared-lib/src/lib/components/address-section/address-section.component';

@Component({
  selector: 'web-user-profile',
  imports: [PersonalDetailsComponent,AddressSectionComponent],
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
