export const PRODUCT_TYPE = [
  {label:'Top Selling',isActive:false,key:'top_selling'},
  {label:'Popular Sale',isActive:false,key:'popular_sale'},
  {label:'New Arrivals',isActive:false,key:'new_arrivals'}
];

export const  promoBannerSlideConfig = {
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 2000,
    dots: false,
    // centerMode: true,
    centerPadding: '20px',  // MUST have 'px' or '%'
    lazyLoad: 'ondemand',
    responsive: [
      {
        breakpoint: 540,
        settings: {
          slidesToShow: 1,
          centerPadding: '8px',
          arrows: false,
        }
      }
    ]
  };
 export const productSectionSlideConfig = {
    slidesToShow: 5,
    infinite: false,
    autoplaySpeed: 2000,
    dots: false,
    centerMode: false,
    lazyLoad: 'ondemand',
    centerPadding: '12px',
    arrows: true,
    responsive: [
      {
        breakpoint: 1320,
        settings: {
          centerPadding: '40px',
        }
      },
      {
      breakpoint: 1100, // 👈 IMPORTANT
      settings: {
        slidesToShow: 4,
        centerPadding: '16px',
      }
      },
      {
      breakpoint: 992, // 👈 IMPORTANT
      settings: {
        slidesToShow: 3,
        centerPadding: '16px',
      }
      },
      {
        breakpoint: 540,
        settings: {
          slidesToShow: 1.8,
          centerPadding: '16px',
          // dots:true
        }
      }
    ]
  };