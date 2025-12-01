import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'web-user-profile',
  imports: [],
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
