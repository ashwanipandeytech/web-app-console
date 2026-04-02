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
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ProductVariantService } from '../../services/product-variant.service';
import { ProductVariantCartModalComponent } from '../product-variant-cart-modal/product-variant-cart-modal.component';

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
  private readonly ngbModal = inject(NgbModal);
  private readonly productVariantService = inject(ProductVariantService);
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
        this.applyProductCardImages(this.productListData);
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
    if (this.productVariantService.isVariantProduct(data)) {
      this.openVariantCartModal(data);
      return;
    }

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
        // if (res.headers) {
        //   let nonLoggedInUserToken = res.headers.get('x-cart-identifier');
        //   //THIS IS TO CHECK WHETHER USER IS GUEST OR NOT
        //   if (nonLoggedInUserToken) {
        //     if (this.isBrowser) {
        //       localStorage.setItem('isNonUser', JSON.stringify(nonLoggedInUserToken));
        //     }
        //   }
        //   this.globalService.showToast(res.body);
        // }
        // let nonLoggedInUserToken = res.headers.get('x-cart-identifier');
        // if (nonLoggedInUserToken) {
        //   localStorage.setItem('isNonUser', JSON.stringify(nonLoggedInUserToken));
        // }
        if (res.success == true) {
          this.globalService.showToast(res);
          this.globalFunctionService.getCount();
          this.cd.detectChanges();
        } 
        // else if(res.success == false){
        //   this.globalService.showToast(res.message);
        // }
        else if (res.error && res.error.message) {
          this.globalService.showToast(res.error);
        }
      });
  }

  private openVariantCartModal(product: any) {
    const modalRef = this.ngbModal.open(ProductVariantCartModalComponent, {
      windowClass: 'mobile-modal',
      centered: true,
      scrollable: true,
      size: 'lg',
    });

    modalRef.componentInstance.product = product;
    const applyVariantImage = (result: any) => {
      if (result?.variantImageUrl) {
        product.__cardImageUrl = result.variantImageUrl;
        this.cd.detectChanges();
      }
    };

    modalRef.result
      .then((result: any) => applyVariantImage(result))
      .catch((reason: any) => applyVariantImage(reason));
  }

  private applyProductCardImages(products: any[]) {
    if (!Array.isArray(products)) {
      return;
    }

    products.forEach((product: any) => {
      const variantState = this.productVariantService.initializeVariantState(product);
      product.__cardImageUrl = this.productVariantService.getProductDisplayImageUrl(
        product,
        variantState.selectedVariant,
      );
    });
  }

  toggleHeart(item: any) {
    if (String(item?.product_type || '').toLowerCase() === 'variable') {
      this.globalService.showToast({
        success: false,
        message: 'Please choose variants on the product details page before adding to wishlist.',
      });
      this.openProduct(item);
      return;
    }

    this.isWishlisted = !this.isWishlisted;
    const data: any = {
      product_id: item.id,
    };
    const previousState = !!item.is_wishlisted;
    item.is_wishlisted = !previousState;

    this.dataService.post(data, 'wishlist/toggle').subscribe((res: any) => {
      if (res?.success) {
        if (typeof res?.data?.is_wishlisted === 'boolean') {
          item.is_wishlisted = res.data.is_wishlisted;
        }
        this.globalFunctionService.getCount();
      } else {
        item.is_wishlisted = previousState;
      }
      this.cd.detectChanges();
    });
  }
}
