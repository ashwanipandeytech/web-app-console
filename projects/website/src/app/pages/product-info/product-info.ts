import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, ElementRef, inject, Renderer2, ViewChild } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { catchError, of } from 'rxjs';
import { DataService } from 'shared-lib';

@Component({
  selector: 'web-product-info',
  imports: [CommonModule ],
  templateUrl: './product-info.html',
  styleUrl: './product-info.scss'
})
export class ProductInfo {
  @ViewChild('descBox') descBox!: ElementRef;
  public dataService:any= inject(DataService);
  isWishlisted = false;
  productListData: any=[];
  productDetails: any;
  productId: any;
  quantity: any=1;

  constructor(private cd:ChangeDetectorRef,private route:ActivatedRoute,
     private sanitizer: DomSanitizer,
  private renderer: Renderer2


  ){
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
  for (let index = 0; index < this.productDetails.length; index++) {
    const element = this.productDetails[index];
    if (element.id == this.productId) {
      this.renderDescription(element.description);
      this.cd.detectChanges();

    }
  }
}
increase() {
  this.quantity++;
}

decrease() {
  if (this.quantity > 1) {
    this.quantity--;
  }
}
toggleHeart() {
  this.isWishlisted = !this.isWishlisted;
}
}