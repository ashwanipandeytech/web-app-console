
import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'web-header',
  imports: [],
  templateUrl: './header.html',
  styleUrl: './header.scss'
})
export class Header {
  private route = inject(Router);
isLoggedIn:any= false;

  ngOnInit(){
      let userData = localStorage.getItem('user');
    if (userData == null) {
      this.isLoggedIn = false;
    }
    else{
      this.isLoggedIn = true;
    }
  }
  openDashboard(){
    if (this.isLoggedIn) {
      this.route.navigate(['/user-profile.html'])
    }
    else{
      this.route.navigate(['/login'])
    }
  }
}
