export const PRODUCT_TYPE = ['Top Selling','Popular Sale','New Arrivals'];

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
    // centerMode: true,
    lazyLoad: 'ondemand',
    centerPadding: '12px',
    responsive: [
      {
        breakpoint: 1320,
        settings: {
          centerPadding: '40px',
        }
      },
      {
      breakpoint: 769, // 👈 IMPORTANT
      settings: {
        slidesToShow: 3,
        centerPadding: '16px',
        arrows: true,
      }
      },
      {
        breakpoint: 540,
        settings: {
          slidesToShow: 1,
          centerPadding: '16px',
          arrows: true,
          // dots:true
        }
      }
    ]
  };