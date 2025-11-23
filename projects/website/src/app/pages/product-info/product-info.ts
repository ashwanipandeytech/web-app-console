import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CarouselModule } from 'ngx-owl-carousel-o';
import { catchError, of } from 'rxjs';
import { DataService } from 'shared-lib';

@Component({
  selector: 'web-product-info',
  imports: [CarouselModule],
  templateUrl: './product-info.html',
  styleUrl: './product-info.scss'
})
export class ProductInfo {
  public dataService:any= inject(DataService);
  productListData: any=[];
  productDetails: any;
  productId: any;

  productInfoSectionOptions = {
    items: 1,
    loop: true,
    // nav: false,
    dots: true,
    margin: 8,
    // responsive: {
    //   0: {
    //     items: 1
    //   },
    //   576: {
    //     items: 2
    //   },
    //   768: {
    //     items: 3
    //   },
    //   992: {
    //     items: 4,
    //     dots: true,
    //   }
    // },
  }

  constructor(private cd:ChangeDetectorRef,private route:ActivatedRoute){
    this.callAllProductList();
  }

  callAllProductList() {

    // const payload = {
    //   email: this.email,
    //   password: this.password
    // };

    
    this.dataService.callGetApi('products/search','web').pipe(
      catchError((error) => {
        // console.error('Error occurred during login:', error);
       //add toaserfnc alert('Login failed: ' + response.message);
        // Optionally, you can return an observable to prevent further execution
        return of(null); // or you can return a default value if needed
      })
    ).subscribe((response: any) => {
      // console.log('Response:', response);
    this.productListData = response.data.data;
    this.cd.detectChanges();
      if (response && response.success) {
      
      } else if (response) {
       //add toaserfnc alert('Login failed: ' + response.message);
      }
    });
    
  }
  ngOnInit() {
  this.productId = this.route.snapshot.paramMap.get('id');

  this.dataService.callGetById('products',this.productId).subscribe((res:any) => {
    this.productDetails = res.data;
    console.log('productId==>',this.productDetails);
    this.cd.detectChanges();
  });
}
}
