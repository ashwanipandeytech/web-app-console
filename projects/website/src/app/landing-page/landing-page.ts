import { HttpClientModule } from '@angular/common/http';
import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { catchError, of } from 'rxjs';
import { DataService } from 'shared-lib';
import { environment } from 'environments/environment';
import { CarouselModule } from 'ngx-owl-carousel-o';
import { Router } from '@angular/router';
declare var $:any;
@Component({
  selector: 'web-landing-page',
  templateUrl: './landing-page.html',
  imports:[CarouselModule],
  styleUrl: './landing-page.scss',
  standalone:true,
})
export class LandingPage {
 public dataService:any= inject(DataService);
  categoryListData:any;
  productListData: any=[];
  baseURL: string;
  slides = [
    { id: 1, img: 'https://a2zlivestock.com/wp-content/uploads/2025/01/Making-Livestock-Care-Simple-Safe-Effective-7.png' },
    { id: 1, img: 'https://a2zlivestock.com/wp-content/uploads/2025/04/Making-Livestock-Care-Simple-Safe-Effective-16.png' }
  ];

  heroSectionOptions = {
    autoHeight: true,
    autoWidth: true,
    loop: true,
    nav: false,
    dots: true,
    items: 1,
    autoplay: true,
  };

  bannerSectionOptions = {
    loop: true,
    // nav: false,
    dots: true,
    margin: 8,
    responsive: {
      0: {
        items: 1
      },
      576: {
        items: 2
      },
      768: {
        items: 3
      },
      992: {
        items: 4,
        dots: true,
      }
    },
  }
  
  productSectionOptions = {
    loop: true,
    // nav: false,
    dots: true,
    margin: 8,
    responsive: {
      0: {
        items: 2
      },
      576: {
        items: 5
      },
      768: {
        items: 6
      },
      992: {
        items: 8,
        dots: true,
      }
    },
  }

  // slideConfig:any;
    
  constructor(private cd:ChangeDetectorRef, private router: Router){
    this.callAllProductList();
    this.baseURL=environment.DOMAIN;
  }

  ngAfterViewInit() {}

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
ngOnInit(){
  this.getCategoryList();
}
 openProduct(id: number) {
  this.router.navigate(['/product-info', id]);
}
  getCategoryList() {
    this.categoryListData = [];
    this.dataService.callGetApi('categories')
      .pipe(
        catchError(err => {
          console.error('Error:', err);
          return of(null);
        })
      )
      .subscribe((res: any) => {
        console.log('Response:', res);
        if (res.data) {

          for (let i = 0; i < res.data.length; i++) {
            const element = res.data[i];
            console.log('element==>', element.thumbnail);
            if (element?.thumbnail != null) {
              console.log('environment.API_URL==>', environment.API_URL);
              element.thumbnail = environment.DOMAIN + '/' + element.thumbnail;
            }
            this.categoryListData.push(element);
          }
        }
        console.log('categoryListData==>', this.categoryListData);

        this.cd.detectChanges();
        // this.categoryListData = res.data;
      });
  }
}