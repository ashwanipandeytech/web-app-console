import { ChangeDetectorRef, Component, effect, inject, Inject, PLATFORM_ID } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { catchError, of, switchMap } from 'rxjs';
import { DataService } from '../../services/data-service';
import { GlobaCommonlService } from '../../services/global-common.service';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { GlobalFunctionService } from '../../services/global-function.service';
import { NoDataComponent } from '../no-data/no-data.component';
import { SignalService } from '../../services/signal-service';

@Component({
  selector: 'web-category-details',
  imports: [CommonModule, NoDataComponent],
  templateUrl: './product-sidebar.html',
  styleUrl: './product-sidebar.scss',
})
export class ProductSidebarCommon {
  ratingStars: number[] = [1, 2, 3, 4, 5];
  public dataService: any = inject(DataService);
  private globalFunctionService = inject(GlobalFunctionService);
  productListData: any = [];
  categoryListData: any;
  public globalService: any = inject(GlobaCommonlService);
  private route = inject(ActivatedRoute);
  productId: any;
  filteredProductList: any;
  defaultProductListData: any;
  isWishlisted: boolean = false;
  isLoading: boolean = false;
  isLogin: boolean = false;
  isBrowser: boolean;
  private platformId = inject(PLATFORM_ID);
  private signalService = inject(SignalService);
  constructor(
    private cd: ChangeDetectorRef,
    private router: Router,
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    effect(() => {
      let isLoggedIn: any = null;
      if (this.isBrowser) {
        isLoggedIn = localStorage.getItem('isLoggedIn');
      }
      //console.log('isLoggedIn==>',isLoggedIn,this.signalService.userLoggedIn());

      if (isLoggedIn == 'true' || this.signalService.userLoggedIn()) {
        this.isLogin = true;
      } else {
        this.isLogin = false;
      }
      this.cd.detectChanges();
      //  }
    });
    this.callAllProductList();
    this.getCategoryList();
  }

  openProduct(item: any) {
    this.router.navigate([`/product-details/${item.product_details.permaLink}`],{queryParams:{id:item.id}});
  }
  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');

      if (id) {
        this.isLoading = true;
        this.productId = id;
        // //console.log('this.productListData==>',this.productListData);
        // //console.log('defaultProductListData==>',this.defaultProductListData);
        if (this.defaultProductListData) {
          this.productListData = this.defaultProductListData.filter(
            (item: any) => item.category.id == id,
          );
          this.isLoading = false;
        }
      }
      if (this.isBrowser) {
        window.scrollTo(0, 0);
      }
    });

    // this.productId = this.route.snapshot.paramMap.get('id');
    // //console.log(this.productId);
  }
  callAllProductList() {
    this.isLoading = true;
    // const payload = {
    //   email: this.email,
    //   password: this.password
    // };

    this.dataService
      .get('products/search', 'web')
      .pipe(
        catchError((error) => {
          // console.error('Error occurred during login:', error);
          //add toaserfnc alert('Login failed: ' + response.message);
          // Optionally, you can return an observable to prevent further execution
          return of(null); // or you can return a default value if needed
        }),
      )
      .subscribe((response: any) => {
        // //console.log('Response:', response);
        this.defaultProductListData = response.data.data;
        if (this.productId != 'all') {
          this.productListData = this.defaultProductListData.filter(
            (item: any) => item.category.id == this.productId,
          );
          this.isLoading = false;
        } else {
          this.productListData = response.data.data;
          this.isLoading = false;
        }
        //console.log('this.productListData.length',this.productListData.length);

        this.cd.detectChanges();
        // if (response && response.success) {

        // } else if (response) {
        //  //add toaserfnc alert('Login failed: ' + response.message);
        // }
      });
  }

  getCategoryList() {
    this.categoryListData = [];
    this.dataService
      .get('categories')
      .pipe(
        catchError((err) => {
          console.error('Error:', err);
          return of(null);
        }),
      )
      .subscribe((res: any) => {
        //console.log('Response:', res);
        if (res.data) {
          for (let i = 0; i < res.data.length; i++) {
            const element = res.data[i];
            if (element?.thumbnail != null) {
              element.thumbnail = environment.DOMAIN + '/' + element.thumbnail;
            }
            this.categoryListData.push(element);
          }
        }
        this.cd.detectChanges();
        // this.categoryListData = res.data;
      });
  }

  back() {
    if (this.isBrowser) {
      window.history.back();
    }
  }

  addToCart(data: any) {
    let isGuest: any = null;
    if (this.isBrowser) {
      isGuest = JSON.parse(localStorage.getItem('GUEST_TOKEN') || 'null');
    }
    let finalData = {
      product_id: data.id,
      quantity: '1',
      guest_token: isGuest,
    };
    // //console.log('finalData==.',finalData);
    // return;
    this.dataService
      .post(finalData, 'cart')
      .pipe(
        catchError((err) => {
          return of(err);
        }),
      )
      .subscribe((res: any) => {
        // //console.log('Response:', res);
        // //console.log('🧩 x-cart-identifier:', res.headers.get('x-cart-identifier'));
        if (res.headers) {
          let nonLoggedInUserToken = res.headers.get('x-cart-identifier');
          //THIS IS TO CHECK WHETHER USER IS GUEST OR NOT
          if (nonLoggedInUserToken) {
            if (this.isBrowser) {
              localStorage.setItem('isNonUser', JSON.stringify(nonLoggedInUserToken));
            }
          }
          this.globalService.showMsgSnackBar(res.body);
        }
        // let nonLoggedInUserToken = res.headers.get('x-cart-identifier');
        // if (nonLoggedInUserToken) {
        //   localStorage.setItem('isNonUser', JSON.stringify(nonLoggedInUserToken));
        // }
        if (res.success == true) {
          this.globalService.showMsgSnackBar(res);
          this.globalFunctionService.getCount();
          this.cd.detectChanges();
        } else if (res.error && res.error.message) {
          this.globalService.showMsgSnackBar(res.error);
        }
      });
  }
  toggleHeart(item: any) {
    this.isWishlisted = !this.isWishlisted;
    let data = {
      product_id: item.id,
    };
    if (item.is_wishlisted) {
      item.is_wishlisted = !item.is_wishlisted;
      this.dataService.delete(`wishlist/product/${data.product_id}`).subscribe((res: any) => {
        this.globalFunctionService.getCount();
        this.cd.detectChanges();

        //console.log('wishlist==>',res);
      });
    } else {
      item.is_wishlisted = !item.is_wishlisted;
      this.dataService.post(data, 'wishlist').subscribe((res: any) => {
        this.globalFunctionService.getCount();
        this.cd.detectChanges();

        //console.log('wishlist==>',res);
      });
    }
    // this.callAllProductList();
    // this.globalFunctionService.getCount();
    // this.cd.detectChanges();
  }
}
