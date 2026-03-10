import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { DataService } from 'shared-lib/services/data-service';

@Component({
  selector: 'app-header',
  imports: [],
  templateUrl: './header.html',
  styleUrl: './header.scss'
})
export class Header {
dataService = inject(DataService);
  constructor(private route:Router){

  }
  logout(){
    localStorage.clear();
    this.route.navigate(['/']);
    window.location.reload();
  }

}
