import { NgOptimizedImage, NgClass } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { SlickCarouselModule } from 'ngx-slick-carousel';

@Component({
  selector: 'app-hero-section-v1',
  templateUrl: './hero-section-v1.component.html',
  imports: [SlickCarouselModule, NgClass],
  styleUrls: ['./hero-section-v1.component.scss'],
})
export class HeroSectionV1Component implements OnInit {
  @Input() data: any;
  slides: any;
  heroBannerSlideConfig = {
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 2000,
    dots: true,
    arrows: false,
    lazyLoad: 'ondemand',
  };
  constructor() {}

  ngOnInit() {
    console.log('HeroSectionV1Component load', this.data);
    this.slides = this.data.data.heroImage;
  }
}
