import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, ElementRef, inject, Renderer2, ViewChild } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, of } from 'rxjs';
import { DataService } from 'shared-lib';
import { SlickCarouselModule  } from 'ngx-slick-carousel';

@Component({
  selector: 'web-product-info',
  imports: [CommonModule, SlickCarouselModule],
  templateUrl: './product-info.html',
  styleUrl: './product-info.scss'
})
export class ProductDetailCommon {
  @ViewChild('descBox') descBox!: ElementRef;
  public dataService:any= inject(DataService);
  isWishlisted = false;
  productListData: any=[];
  productDetails: any;
  productId: any;
  quantity: any=1;
  selectedProduct: any;
  productPrice: any;

  slideConfig = {
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 2000,
    dots: true,
    arrows: true,
  };

  productSectionSlideConfig = {
    // slidesToScroll: 1,
    autoplaySpeed: 2000,
    dots: true,
    // centerMode: true,
    lazyLoad: 'ondemand',
    centerPadding: '12px',
    responsive: [
      {
        breakpoint: 1440,
        settings: {
          centerPadding: '40px',
          slidesToShow: 7,
        }
      },
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 6
        }
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 5
        }
      },
      {
        breakpoint: 540,
        settings: {
          slidesToShow: 3,
          centerPadding: '8px'
        }
      }
    ]
  };

  constructor(private cd:ChangeDetectorRef,private route:ActivatedRoute, private sanitizer: DomSanitizer, private renderer: Renderer2,private router: Router){
    this.callAllProductList();
  }

  // callAllProductList() {

  //   // const payload = {
  //   //   email: this.email,
  //   //   password: this.password
  //   // };

    
  //   this.dataService.callGetApi('products/search','web').pipe(
  //     catchError((error) => {
  //       // console.error('Error occurred during login:', error);
  //      //add toaserfnc alert('Login failed: ' + response.message);
  //       // Optionally, you can return an observable to prevent further execution
  //       return of(null); // or you can return a default value if needed
  //     })
  //   ).subscribe((response: any) => {
  //     // console.log('Response:', response);
  //   this.productListData = response.data.data;
  //   this.cd.detectChanges();
  //     if (response && response.success) {
      
  //     } else if (response) {
  //      //add toaserfnc alert('Login failed: ' + response.message);
  //     }
  //   });
    
  // }
  ngOnInit() {
    window.scrollTo(0,0);
    this.productId = this.route.snapshot.paramMap.get('id');

    this.dataService.callGetById('products',this.productId).subscribe((res:any) => {
      this.productDetails = res.data;
      console.log('productId==>',this.productDetails);
      this.cd.detectChanges();
    });
  }
  renderDescription(html: string) {
    const safeHtml = this.sanitizer.bypassSecurityTrustHtml(html);
    const div = this.renderer.createElement('div');
    div.innerHTML = safeHtml as string;
    this.renderer.appendChild(this.descBox.nativeElement, div);
  }
  ngAfterViewInit() {
    if (this.productDetails) {  
      for (let index = 0; index < this.productDetails.length; index++) {
        const element = this.productDetails[index];
        if (element.id == this.productId) {
          this.renderDescription(element.description);
          this.cd.detectChanges();
  
        }
      }
    }
  }
    addToCart() {

    let cartPayload = {
      product_id:this.selectedProduct.id,
      quantity:this.quantity
    }
  this.dataService.callApiNew(cartPayload, 'cart')
      .pipe(
        catchError(err => {
          console.error('Error:', err);

          return of(null);
        })
      )
      .subscribe((res: any) => {
        console.log('Response:', res);
        if (res.success == true) {   
          this.router.navigate(['/cart']);
        }
      });

  }

    callAllProductList() {
    this.dataService.callGetApi('products/search','web').pipe(
      catchError((error) => {
        return of(null); // or you can return a default value if needed
      })
    ).subscribe((response: any) => {
      // console.log('Response:', response);
    this.productListData = response.data.data;
    for (let i = 0; i <  this.productListData.length; i++) {
      const element =  this.productListData[i];
      if(element.id == this.productId){
        this.selectedProduct = element;
        this.productPrice = element.price_data.regularPrice;
      }
      
    }
    console.log('productListData==>',this.productListData);
    
    this.cd.detectChanges();
      if (response && response.success) {
      
      } else if (response) {
       //add toaserfnc alert('Login failed: ' + response.message);
      }
    });
    
  }
  
  //  ngAfterViewInit() {
  //   for (let index = 0; index < this.productDetails.length; index++) {
  //     const element = this.productDetails[index];
  //     if (element.id == this.productId) {
  //       // this.cd.detectChanges();

  //     }
  //   }
  // }
   increase() {
    this.quantity++;
    this.calculatePrice();
  }

  decrease() {
    if (this.quantity > 1) {
      this.quantity--;
      this.calculatePrice();
    }
  }
  toggleHeart() {
    this.isWishlisted = !this.isWishlisted;
  }
      calculatePrice(){
    this.selectedProduct.price_data.regularPrice = this.productPrice * this.quantity;
    this.cd.detectChanges();
      }
  back(){
    window.history.back();
  }
}