import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, ElementRef, inject, Renderer2, ViewChild } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, of } from 'rxjs';
import { DataService } from '../../services/data-service';
import { SlickCarouselModule  } from 'ngx-slick-carousel';
import { GlobaCommonlService } from '../../services/global-common.service';
import { GlobalFunctionService } from '../../services/global-function.service';

@Component({
  selector: 'app-product-details',
  imports: [CommonModule, SlickCarouselModule],
  templateUrl: './product-details.html',
  styleUrl: './product-details.scss'
})
export class ProductDetails {
  @ViewChild('descBox') descBox!: ElementRef;
  public dataService:any= inject(DataService);
  public globalService:any= inject(GlobaCommonlService);
  private globalFunctionService = inject(GlobalFunctionService);

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
    slidesToShow: 5,
    // slidesToScroll: 1,
    autoplaySpeed: 2000,
    dots: true,
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
          slidesToShow: 5
        }
      },
      {
        breakpoint: 540,
        settings: {
          slidesToShow: 3,
          centerPadding: '16px',
          arrows: false,
        }
      }
    ]
  };
  
  loading: boolean=true;
  isLogin: boolean=false;

  constructor(private cd:ChangeDetectorRef,private route:ActivatedRoute, private sanitizer: DomSanitizer, private renderer: Renderer2,private router: Router){
    this.callAllProductList();
  }

  ngOnInit() {
    window.scrollTo(0,0);
    this.productId = this.route.snapshot.paramMap.get('id');

    this.dataService.getById('products',this.productId).subscribe((res:any) => {
      this.productDetails = res.data;
      // console.log('productId==>',this.productDetails);
      let user = JSON.parse(localStorage.getItem('user') || '{}');
    console.log('user==>',user);

    if ( typeof user === 'object' && Object.keys(user).length <= 0) {
      this.isLogin = false;
    }
    else{
      this.isLogin = true;

    }
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

  // openProduct(id: number) {
  //   this.router.navigate(['/product-details', id]);
  // }

  addToCart(action:any='') {
      let isGuest: any = JSON.parse(localStorage.getItem('GUEST_TOKEN') || 'null');
    console.log('localStorage.getItem -====',localStorage.getItem('user'));
    // if (localStorage.getItem('user') == null) {
    //   this.router.navigate(['/login']);
    // }
    let cartPayload = {
      product_id:this.selectedProduct.id,
      quantity:1,
      guest_token:isGuest
    }
    this.dataService.post(cartPayload, 'cart')
      .pipe(
        catchError(err => {
          console.error('Error:', err);

          return of(err);
        })
      )
      .subscribe((res: any) => {
        console.log('Response:', res);
         if (res.headers) {
          let nonLoggedInUserToken = res.headers.get('x-cart-identifier');
          //THIS IS TO CHECK WHETHER USER IS GUEST OR NOT
          if (nonLoggedInUserToken) {
            localStorage.setItem('isNonUser', JSON.stringify(nonLoggedInUserToken));
          }
          this.globalService.showMsgSnackBar(res.body);
        }
         if (res.success == true) {
         // console.info('herer add to cart')
            this.globalFunctionService.getCount();
          this.globalService.showMsgSnackBar(res);
          this.cd.detectChanges();
          // this.globalFunctionService.getCount();
        }
        // if (res.success ==true) {
        //   this.globalService.showMsgSnackBar(res);
        //   // if (action == 'buy') {
        //   // this.router.navigate(['/checkout']);
        //   //   return;
        //   // }
        //   // this.router.navigate(['/cart']);
        // // window.location.reload();
        // }
       else if (res.error && res.error.message) {
          this.globalService.showMsgSnackBar(res.error);
        }





        if (res.success == true) {   
        
        }
      });

  }

  callAllProductList() {
      this.loading = true;  // show loader
    this.dataService.get('products/search','web').pipe(
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
    this.loading = false;
    this.cd.detectChanges();
      if (response && response.success) {
      
      } else if (response) {
       //add toaserfnc alert('Login failed: ' + response.message);
      }
    });
    
  }
  
  // increase() {
  //   this.quantity++;
  //   this.calculatePrice();
  // }

  // decrease() {
  //   if (this.quantity > 1) {
  //     this.quantity--;
  //     this.calculatePrice();
  //   }
  // }

  toggleHeart(item:any) {
    this.isWishlisted = !this.isWishlisted;
    let data = {
      product_id:item.id
    }
    console.log('item==>',item.is_wishlisted);
    
  if (item.is_wishlisted) {
     item.is_wishlisted = !item.is_wishlisted;
      this.dataService.delete('wishlist/product',data.product_id).subscribe((res:any)=>{
        console.log('wishlist==>',res);
      })
    }
    else{
       item.is_wishlisted = !item.is_wishlisted;
      this.dataService.post(data,'wishlist').subscribe((res:any)=>{
        console.log('wishlist==>',res);
      })
    }
    //  this.callAllProductList();
    this.globalFunctionService.getCount();
    this.cd.detectChanges();




    // if (this.isWishlisted) {
    //   this.dataService.post(data,'wishlist').subscribe((res:any)=>{
    //     console.log('wishlist==>',res);
    //   })
    // }
    // else{
    //      this.dataService.delete('wishlist/product',data.product_id).subscribe((res:any)=>{
    //     console.log('wishlist==>',res);
    //   })
    // }
  }

  // calculatePrice(){
  //   this.selectedProduct.price_data.regularPrice = this.productPrice * this.quantity;
  //   this.cd.detectChanges();
  // }

  back(){
    window.history.back();
  }
}