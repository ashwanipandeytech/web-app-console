import {
  ChangeDetectorRef,
  Component,
  effect,
  ElementRef,
  inject,
  Inject,
  PLATFORM_ID,
  ViewChild,
  TemplateRef
} from '@angular/core';
import { DataService } from '../../../services/data-service';
import { GlobaCommonlService } from '../../../services/global-common.service';
import { catchError, of } from 'rxjs';
import { GlobalFunctionService } from '../../../services/global-function.service';
import { NoDataComponent } from '../../no-data/no-data.component';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { SignalService } from '../../../services/signal-service';
@Component({
  selector: 'web-wishlist',
  imports: [NoDataComponent, CommonModule],
  templateUrl: './wishlist.html',
  styleUrl: './wishlist.scss',
})
export class Wishlist {
  @ViewChild('removeProduct') removeProduct!: TemplateRef<any>;
  private ngbModal = inject(NgbModal);
  private modalRef?: NgbModalRef;
  public dataService: any = inject(DataService);
  public signalService: any = inject(SignalService);
  public globalFunctionService: any = inject(GlobalFunctionService);
  public globalCommonService: any = inject(GlobaCommonlService);
  public cd = inject(ChangeDetectorRef);
  ratingStars = [1, 2, 3, 4, 5];
  wishListData: any = [];
  WishListId: any;
  isLoading: boolean = true;
  isBrowser: boolean;
  private platformId = inject(PLATFORM_ID);
  isLoggedIn: any;
  constructor() {
    this.isBrowser = isPlatformBrowser(this.platformId);

    effect(() => {
      if (this.signalService.userLoggedIn()) {
        this.isLoggedIn=true
        this.getWishlistData();
        this.cd.detectChanges();
      }
    });
  }
  ngOnInit() {
    if (this.isBrowser) {
      this.isLoggedIn = JSON.parse(localStorage.getItem('isLoggedIn') || 'null');

      if (!this.isLoggedIn) {
        this.signalService.openLoginPopup.set(true);
        this.cd.detectChanges();
        // return;
      }
    }
    this.getWishlistData();
  }

  private isVariableWishlistItem(item: any): boolean {
    const productType = String(item?.product?.product_type || item?.product_type || '').toLowerCase();
    return (
      productType === 'variable' ||
      item?.variant_id !== undefined ||
      item?.variant !== undefined ||
      item?.variant_details !== undefined
    );
  }

  getWishlistVariantId(item: any): number | string | null {
    const candidates = [
      item?.variant_id,
      item?.variant?.id,
      item?.variant?.variant_id,
      item?.variant_details?.id,
      item?.variant_details?.variant_id,
      item?.product_variant_id,
    ];

    for (const candidate of candidates) {
      if (candidate !== null && candidate !== undefined && candidate !== '') {
        return candidate;
      }
    }

    return null;
  }

  getWishlistVariantAttributes(item: any): Array<{ name: string; value: string }> {
    const variantDetails = item?.variant_details || item?.variant || {};
    const rawAttributes = Array.isArray(variantDetails?.attributes)
      ? variantDetails.attributes
      : Array.isArray(item?.attributes_detail)
        ? item.attributes_detail
        : [];

    return rawAttributes
      .map((attribute: any) => ({
        name: String(attribute?.name ?? attribute?.attribute_name ?? '').trim(),
        value: String(attribute?.value ?? attribute?.value_name ?? '').trim(),
      }))
      .filter((attribute: any) => attribute.name && attribute.value);
  }

  canAddWishlistItemToCart(item: any): boolean {
    const stockStatus = item?.product?.inventory?.stockStatus;
    if (stockStatus && stockStatus !== 'in_stock') {
      return false;
    }

    if (this.isVariableWishlistItem(item) && !this.getWishlistVariantId(item)) {
      return false;
    }

    return true;
  }

  getWishlistData() {
    this.isLoading = true;
    this.dataService.get('wishlist').subscribe((res: any) => {
      this.wishListData = Array.isArray(res?.data?.data)
        ? res.data.data
        : Array.isArray(res?.data)
          ? res.data
          : [];
      this.isLoading = false;
      this.globalFunctionService.getCount();
      this.cd.markForCheck();
    });
  }
  removeWishlist(id: any) {
    this.WishListId = id;
    this.modalRef = this.ngbModal.open(this.removeProduct, {
      windowClass: 'mobile-modal',
      centered: true,
    });
  }
  remove() {
    this.dataService.delete(`wishlist/${this.WishListId}`).subscribe((res: any) => {
      let response = {
        message: 'Item Removed from Wish List',
        success: true,
      };
      if (this.modalRef) {
        this.modalRef.close();
      }
      this.globalCommonService.showToast(response);
      this.getWishlistData();
      this.cd.markForCheck();
    });
  }
  addToCart(item: any) {
    let isGuest: any = null;
    if (this.isBrowser) {
      isGuest = JSON.parse(localStorage.getItem('GUEST_TOKEN') || 'null');
    }

    const product = item?.product || item;
    const variantId = this.getWishlistVariantId(item);
    if (this.isVariableWishlistItem(item) && !variantId) {
      this.globalCommonService.showToast({
        success: false,
        message: 'Please select this variable product from product details before adding to cart.',
      });
      return;
    }

    const finalData: any = {
      product_id: product?.id,
      quantity: 1,
      guest_token: isGuest,
    };
    if (variantId !== null && variantId !== undefined && variantId !== '') {
      finalData.variant_id = variantId;
    }

    this.dataService
      .post(finalData, 'cart')
      .pipe(
        catchError((err) => {
          return of(err);
        }),
      )
      .subscribe((res: any) => {
        //console.log('Response:', res);
        // //console.log('🧩 x-cart-identifier:', res.headers.get('x-cart-identifier'));
        if (res.headers) {
          let nonLoggedInUserToken = res.headers.get('x-cart-identifier');
          //THIS IS TO CHECK WHETHER USER IS GUEST OR NOT
          if (nonLoggedInUserToken) {
            if (this.isBrowser) {
              localStorage.setItem('isNonUser', JSON.stringify(nonLoggedInUserToken));
            }
          }
          this.globalCommonService.showToast(res.body);
        }
        if (res.success == true) {
          this.globalCommonService.showToast(res);
          this.globalFunctionService.getCount();
        } else if (res.error && res.error.message) {
          this.globalCommonService.showToast(res.error);
        }
        // EMIT THE CART ADDED SIGNAL
      });
  }
}
