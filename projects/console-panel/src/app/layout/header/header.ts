import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-header',
  imports: [NgbDropdownModule],
  templateUrl: './header.html',
  styleUrl: './header.scss'
})
export class Header {

  constructor(private route:Router){

  }
  logout(){
    localStorage.clear();
    this.route.navigate(['/']);
    window.location.reload();
  }

}
