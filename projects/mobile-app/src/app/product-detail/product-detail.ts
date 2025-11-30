import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CarouselModule } from 'ngx-owl-carousel-o';
import { catchError, of } from 'rxjs';
import { DataService } from 'shared-lib';

@Component({
  selector: 'app-product-detail-common',
  imports: [CommonModule,CarouselModule],
  templateUrl: './product-detail.html',
  styleUrl: './product-detail.scss'
})
export class ProductDetail {
  productListData:any=[];
    productInfoSectionOptions = {
    items: 1,
    loop: true,
    dots: true
  }
  productId:any;
private dataService:any = inject(DataService);
  productDetails: any;
  quantity: any=1;
  isWishlisted: boolean=false;
  selectedProduct: any={};
  productPrice: any=0;
  constructor(private router: Router,private route:ActivatedRoute,private cd:ChangeDetectorRef){
this.callAllProductList();
  }

  ngOnInit(){
     this.productId = this.route.snapshot.paramMap.get('id');
      this.dataService.callGetById('products',this.productId).subscribe((res:any) => {
      this.productDetails = res.data;
      console.log('productId==>',this.productDetails);
      // this.cd.detectChanges();
    });
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
