export const PRODUCT_TYPE = ['Top Selling','Popular Sale','New Arrivals'];


 export const productSectionSlideConfig = {
    slidesToShow: 4.5,
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
        breakpoint: 768,
        settings: {
          slidesToShow: 4
        }
      },
      {
        breakpoint: 540,
        settings: {
          slidesToShow: 2,
          centerPadding: '16px',
          arrows: false,
        }
      }
    ]
  };