import { Component, Input, OnInit } from '@angular/core';
import { SlickCarouselModule } from 'ngx-slick-carousel';
import { promoBannerSlideConfig } from 'shared-lib/constants/app-constant';
@Component({
  selector: 'app-grid',
  templateUrl: './grid.component.html',
  imports:[SlickCarouselModule],
  styleUrls: ['./grid.component.scss']
})
export class GridComponent implements OnInit {
promoBannerSlideConfig = promoBannerSlideConfig;
 @Input () data:any
  constructor() { }

  ngOnInit() {
  }

}
