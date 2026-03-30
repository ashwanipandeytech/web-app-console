import { ChangeDetectorRef, Component, effect, inject, Inject, Input, input, OnInit, PLATFORM_ID } from '@angular/core';
import { productSectionSlideConfig } from '../../constants/app-constant';
import { SlickCarouselModule } from 'ngx-slick-carousel';
import { catchError, of } from 'rxjs';
import { DataService } from '../../services/data-service';
import { Router } from '@angular/router';
import { GlobaCommonlService } from '../../services/global-common.service';
import { GlobalFunctionService } from '../../services/global-function.service';

import { CommonModule, isPlatformBrowser } from '@angular/common';
import { SignalService } from '../../services/signal-service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ProductVariantService } from '../../services/product-variant.service';
import { ProductVariantCartModalComponent } from '../product-variant-cart-modal/product-variant-cart-modal.component';

@Component({
  selector: 'app-product',
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.scss'],
  imports: [SlickCarouselModule, CommonModule],
})
export class ProductComponent implements OnInit {
  productSectionSlideConfig = productSectionSlideConfig;
  public globalService: any = inject(GlobaCommonlService);
  private globalFunctionService = inject(GlobalFunctionService);
  private signalService = inject(SignalService);
  private readonly productVariantService = inject(ProductVariantService);
  private readonly ngbModal = inject(NgbModal);
  dataService = inject(DataService);
  cd = inject(ChangeDetectorRef);
  productListData: any = [];
  router = inject(Router);
  @Input() data: any;
  productData: any;
  isWishlisted: boolean = false;
  isLogin: boolean=false;
  isBrowser: boolean;
  private platformId = inject(PLATFORM_ID);
  constructor() {
    this.isBrowser = isPlatformBrowser(this.platformId);
    effect(()=>{

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
  }

  ngOnInit() {
    if (this.data) {
      this.productData = this.data;
    }
    this.callAllProductList();
  }

  openProduct(item: any) {

    console.log('openProduct===>',item.product_details.permaLink);
    
   this.router.navigate(
  ['/product-details', item.product_details.permaLink],
  {
    queryParams: { id: item.id }
  }
);
  }
  toggleHeart(item: any) {
    const productType = String(item?.product_type || '').toLowerCase();
    if (productType === 'variable') {
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
  callAllProductList() {
    this.dataService
      .get('products/search', 'web')
      .pipe(
        catchError((error) => {
          return of(null);
        })
      )
      .subscribe((response: any) => {
        const products = Array.isArray(response?.data?.data) ? response.data.data : [];
        this.productListData = this.filterProductsBySection(products);

        this.cd.detectChanges();
        if (response && response.success) {
        } else if (response) {
          //add toaserfnc alert('Login failed: ' + response.message);
        }
      });
  }

  private filterProductsBySection(products: any[]) {
    const sectionTitle = this.productData?.data?.title || this.data?.data?.title || '';
    const filterLabel = this.getFlagLabelBySectionTitle(sectionTitle);

    if (!filterLabel) {
      return products;
    }

    return products.filter((product: any) => this.hasActiveFlag(product, filterLabel));
  }

  private hasActiveFlag(product: any, filterLabel: string) {
    const flags = Array.isArray(product?.flags) ? product.flags : [];
    const normalizedFilterLabel = this.normalizeFlagLabel(filterLabel);

    return flags.some((flag: any) => {
      return this.normalizeFlagLabel(flag?.label) === normalizedFilterLabel && !!flag?.isActive;
    });
  }

  private getFlagLabelBySectionTitle(title: string) {
    const normalizedTitle = this.normalizeFlagLabel(title);

    if (normalizedTitle.includes('top selling')) {
      return 'Top Selling';
    }
    if (normalizedTitle.includes('popular sale')) {
      return 'Popular Sale';
    }
    if (normalizedTitle.includes('new arrivals')) {
      return 'New Arrivals';
    }

    return '';
  }

  private normalizeFlagLabel(value: string | null | undefined) {
    const normalized = String(value || '')
      .toLowerCase()
      .replace(/\s+/g, ' ')
      .trim();

    if (normalized === 'top selling products' || normalized === 'top selling product') {
      return 'top selling';
    }
    if (normalized === 'popular sales') {
      return 'popular sale';
    }
    if (normalized === 'new arrival') {
      return 'new arrivals';
    }

    return normalized;
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
      // const guestToken = isGuest;
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
        })
      )
      .subscribe((res: any) => {
        //console.log('Response:', res);
        // //console.log('🧩 x-cart-identifier:', res.headers.get('x-cart-identifier'));
        // if (res.headers) {
        //   let nonLoggedInUserToken = res.headers.get('x-cart-identifier');
        //   //THIS IS TO CHECK WHETHER USER IS GUEST OR NOT
        //   if (nonLoggedInUserToken) {
        //     localStorage.setItem('isNonUser', JSON.stringify(nonLoggedInUserToken));
        //   }
        //   this.globalService.showToast(res.body);
        // }
        if (res.success == true) {
          // console.info('herer add to cart')
          // this.globalFunctionService.getCount();
          this.globalService.showToast(res);
          this.globalFunctionService.getCount();
          this.cd.detectChanges();
        } else if (res.error && res.error.message) {
          this.globalService.showToast(res.error);
        }
        // EMIT THE CART ADDED SIGNAL
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
  }
}
