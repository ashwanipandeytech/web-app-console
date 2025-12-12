import { NgOptimizedImage } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { SlickCarouselModule  } from 'ngx-slick-carousel';

@Component({
  selector: 'app-hero-section-v1',
  templateUrl: './hero-section-v1.component.html',
  imports:[SlickCarouselModule],
  styleUrls: ['./hero-section-v1.component.scss']
})
export class HeroSectionV1Component implements OnInit {
@Input() data: any;
slides = [

  {img: '/images/Making-Livestock-Care-Simple-Safe-Effective-7-min.png'},
  {img:'/images/Making-Livestock-Care-Simple-Safe-Effective-16-min.png'},
  ];
heroBannerSlideConfig = {
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 2000,
    dots: true,
    lazyLoad: 'ondemand',
  };
  constructor() { }

  ngOnInit() {
    console.log('HeroSectionV1Component load',this.data);
    
  }

}
