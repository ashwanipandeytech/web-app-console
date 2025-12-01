import { Component } from '@angular/core';
import { SlickCarouselModule } from 'ngx-slick-carousel';

@Component({
  selector: 'web-about-us',
  imports: [SlickCarouselModule],
  templateUrl: './about-us.html',
  styleUrl: './about-us.scss'
})
export class AboutUs {

    slideConfig = {
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 2000,
    dots: true,
    arrows: true,
  };
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
