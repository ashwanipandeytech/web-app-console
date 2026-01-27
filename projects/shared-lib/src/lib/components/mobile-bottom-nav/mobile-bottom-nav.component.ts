import { Component, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-mobile-bottom-nav',
  templateUrl: './mobile-bottom-nav.component.html',
  imports:[RouterLinkActive,RouterLink],
  styleUrls: ['./mobile-bottom-nav.component.scss'],
  standalone:true
})
export class MobileBottomNavComponent implements OnInit {
countsList: any;
  constructor() { }

  ngOnInit() {
  }

}
