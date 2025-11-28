import { Component } from '@angular/core';
import { CarouselModule } from 'ngx-owl-carousel-o';

@Component({
  selector: 'web-about-us',
  imports: [CarouselModule],
  templateUrl: './about-us.html',
  styleUrl: './about-us.scss'
})
export class AboutUs {
  testimonialSectionOptions = {
    loop: true,
    // nav: false,
    dots: true,
    margin: 16,
    responsive: {
      0: {
        items: 2
      },
      576: {
        items: 3
      },
      // 768: {
      //   items: 6
      // },
      // 992: {
      //   items: 8,
      //   dots: true,
      // }
    },
  }
}
