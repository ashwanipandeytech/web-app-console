import { CommonModule, isPlatformBrowser } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  inject,
  ViewChild,
  PLATFORM_ID,
} from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, of } from 'rxjs';
import { DataService } from '../../services/data-service';
import { SlickCarouselModule } from 'ngx-slick-carousel';
import { GlobaCommonlService } from '../../services/global-common.service';
import { GlobalFunctionService } from '../../services/global-function.service';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { Login } from '../auth/login/login';
import { NoDataComponent } from '../no-data/no-data.component';
import { ProductVariantService } from '../../services/product-variant.service';

@Component({
  selector: 'app-product-details',
  imports: [CommonModule, SlickCarouselModule, NoDataComponent],
  templateUrl: './product-details.html',
  styleUrl: './product-details.scss',
})
export class ProductDetails {
  @ViewChild('descBox') descBox!: ElementRef;
  @ViewChild('mainSlick') mainSlick!: any;

  public dataService: any = inject(DataService);
  public globalService: any = inject(GlobaCommonlService);
  private globalFunctionService = inject(GlobalFunctionService);
  private readonly productVariantService = inject(ProductVariantService);
  readonly ngbModal = inject(NgbModal);
  ratingStars: number[] = [1, 2, 3, 4, 5];
  isWishlisted = false;
  productListData: any = [];
  productDetails: any = {};
  productId: any;
  quantity: any = 1;
  selectedProduct: any;
  productPrice: any;
  configurableOptions: any[] = [];
  productVariants: any[] = [];
  selectedVariantOptions: Record<string, string> = {};
  selectedVariant: any = null;
  selectedVariantId: number | string | null = null;
  isVariableProduct = false;
  variantSelectionError = '';
  displaySalePrice: number | null = null;
  displayRegularPrice: number | null = null;
  displayStock: number | null = null;
  shippingInfoSummary: {
    weightText: string | null;
    dimensionsText: string | null;
    shippingClassText: string | null;
  } = {
    weightText: null,
    dimensionsText: null,
    shippingClassText: null,
  };

  mainConfig = {
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: true,
    dots: false,
    infinite: false,
  };

  thumbConfig = {
    slidesToShow: 7,
    slidesToScroll: 1,
    vertical: true,
    verticalSwiping: true,
    arrows: false,
    infinite: false,
    focusOnSelect: true,
  };

  activeIndex = 0;
  displayGalleryImages: any[] = [];
  selectedVariantPreviewImageUrl = '';
  private pendingMainSlideIndex: number | null = null;

  goToSlide(index: number) {
    this.activeIndex = index;
    this.navigateMainSlick(index);
  }

  onMainAfterChange(event: any) {
    this.activeIndex = event.currentSlide;
  }

  onMainSlickInit() {
    if (this.pendingMainSlideIndex === null) {
      return;
    }

    const pendingIndex = this.pendingMainSlideIndex;
    this.pendingMainSlideIndex = null;
    this.navigateMainSlick(pendingIndex, false);
  }

  private navigateMainSlick(index: number, storePending = true) {
    const mainSlickRef = this.mainSlick;
    const canNavigate =
      !!mainSlickRef &&
      !!mainSlickRef.$instance &&
      typeof mainSlickRef.$instance.slick === 'function' &&
      typeof mainSlickRef.slickGoTo === 'function';

    if (!canNavigate) {
      if (storePending) {
        this.pendingMainSlideIndex = index;
      }
      return;
    }

    try {
      mainSlickRef.slickGoTo(index);
      this.pendingMainSlideIndex = null;
    } catch (error) {
      if (storePending) {
        this.pendingMainSlideIndex = index;
      }
      console.warn('Failed to navigate product image slider', error);
    }
  }

  // slideConfig = {
  //   slidesToShow: 1,
  //   slidesToScroll: 1,
  //   autoplay: true,
  //   autoplaySpeed: 2000,
  //   dots: false,
  //   arrows: true,
  // };

  // productSectionSlideConfig = {
  //   slidesToShow: 5,
  //   autoplaySpeed: 2000,
  //   dots: true,
  //   lazyLoad: 'ondemand',
  //   centerPadding: '12px',
  //   responsive: [
  //     {
  //       breakpoint: 1320,
  //       settings: {
  //         centerPadding: '40px',
  //       },
  //     },
  //     {
  //       breakpoint: 768,
  //       settings: {
  //         slidesToShow: 5,
  //       },
  //     },
  //     {
  //       breakpoint: 540,
  //       settings: {
  //         slidesToShow: 3,
  //         centerPadding: '16px',
  //         arrows: false,
  //       },
  //     },
  //   ],
  // };

  loading: boolean = true;
  isLogin: boolean = false;
  isPreview: any;
  isBrowser: boolean;
  safeContent!: SafeHtml;
  safeShortDescription!: SafeHtml;
  safeProductDescription!: SafeHtml;
  safeFeatures!: SafeHtml;
  private platformId = inject(PLATFORM_ID);
  constructor(
    private cd: ChangeDetectorRef,
    private route: ActivatedRoute,
    private sanitizer: DomSanitizer,
    private router: Router,
    
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    this.callAllProductList();
  }
setEditorContent(html: string) {
    this.safeContent = this.sanitizer.bypassSecurityTrustHtml(html);
  }
  ngOnInit() {
    if (this.isBrowser) {
      window.scrollTo(0, 0);
    }

    this.route.queryParams.subscribe((param: any) => {
      this.isPreview = param.preview;
      const routeIdentifier = this.route.snapshot.paramMap.get('value');
      this.productId = param?.id || routeIdentifier;
      if (!this.productId) {
        return;
      }

      this.fetchProductDetails(this.productId);
    });
  }

  ngAfterViewInit() {
  }

  get shouldDisableCartActions(): boolean {
    if (this.isVariableProduct && !this.selectedVariantId) {
      return true;
    }

    return this.isCurrentSelectionOutOfStock();
  }

  get availabilityText(): string {
    if (this.isVariableProduct && this.configurableOptions.length > 0 && !this.selectedVariant) {
      return 'Select options to check stock';
    }

    if (this.isCurrentSelectionOutOfStock()) {
      return 'Out of stock';
    }

    if (this.displayStock === null || this.displayStock === undefined) {
      return 'Stock information unavailable';
    }

    return `${this.displayStock} Products Available`;
  }

  get selectedVariantDisplayName(): string {
    return this.productVariantService.getSelectedVariantDisplayName(
      this.selectedVariant,
      this.configurableOptions,
      this.selectedVariantOptions,
    );
  }

  get hasShippingInfo(): boolean {
    return !!(
      this.shippingInfoSummary.weightText ||
      this.shippingInfoSummary.dimensionsText ||
      this.shippingInfoSummary.shippingClassText
    );
  }

  getOptionName(option: any): string {
    return option?.name || option?.attribute_name || option?.label || 'Option';
  }

  getOptionValues(option: any): any[] {
    return Array.isArray(option?.values) ? option.values : [];
  }

  getOptionValueLabel(value: any): string {
    return String(value?.label ?? value?.value ?? value?.name ?? value?.text ?? value?.id ?? '');
  }

  isVariantOptionSelected(option: any, value: any): boolean {
    const optionKey = this.getOptionKey(option);
    const valueId = this.getOptionValueId(value);
    return this.selectedVariantOptions[optionKey] === valueId;
  }

  isVariantOptionDisabled(option: any, value: any): boolean {
    if (!this.isVariableProduct || this.productVariants.length === 0) {
      return false;
    }

    const optionKey = this.getOptionKey(option);
    const valueId = this.getOptionValueId(value);
    const testSelection = { ...this.selectedVariantOptions, [optionKey]: valueId };
    const selectedIds = Object.values(testSelection).filter((id) => id !== '');

    return !this.productVariants.some((variant: any) => {
      if (!this.isVariantAvailable(variant)) {
        return false;
      }
      const variantIdSet = new Set(
        this.normalizeAttributeValueIds(variant?.attribute_value_ids).map((id) =>
          this.normalizeId(id)
        )
      );
      return selectedIds.every((id) => variantIdSet.has(this.normalizeId(id)));
    });
  }

  onVariantOptionSelect(option: any, value: any) {
    this.selectedVariantOptions = this.productVariantService.toggleVariantOptionSelection(
      option,
      value,
      this.selectedVariantOptions,
    );
    this.variantSelectionError = '';
    this.resolveSelectedVariant();
  }


  addToCart(action: any = '') {
    const productId = this.productDetails?.id || this.selectedProduct?.id;
    if (!productId) {
      this.globalService.showToast({
        success: false,
        message: 'Unable to add this product to cart right now.',
      });
      return;
    }

    if (this.isCurrentSelectionOutOfStock()) {
      this.globalService.showToast({
        success: false,
        message: 'This product is currently out of stock.',
      });
      return;
    }

    if (!this.validateVariantSelection('add this item to cart')) {
      return;
    }

    let isGuest: any = null;
    if (this.isBrowser) {
      isGuest = JSON.parse(localStorage.getItem('GUEST_TOKEN') || 'null');
    }

    const cartPayload: any = {
      product_id: productId,
      quantity: 1,
      guest_token: isGuest,
    };

    if (this.isVariableProduct && this.selectedVariantId !== null) {
      cartPayload.variant_id = this.selectedVariantId;
    }

    this.dataService
      .post(cartPayload, 'cart')
      .pipe(
        catchError((err) => {
          console.error('Error:', err);
          return of(err);
        })
      )
      .subscribe((res: any) => {
        if (res.success == true) {
          this.globalFunctionService.getCount();
          this.globalService.showToast(res);
          this.cd.detectChanges();
          this.router.navigate(['/checkout']);
        } else if (res.error && res.error.message) {
          this.globalService.showToast(res.error);
        }
      });
  }
  openLogin() {
    const modalRef: NgbModalRef = this.ngbModal.open(Login, {
      windowClass: 'mobile-modal login-popup',
      scrollable: true,
      centered: true,
    });
    modalRef.result
      .then((result) => {
        //console.log('Modal closed with result:', result);
      })
      .catch((reason) => {
        //console.log('Modal dismissed:', reason);
      });
  }
  callAllProductList() {
    this.loading = true; // show loader
    this.dataService
      .get('products/search', 'web')
      .pipe(
        catchError((error) => {
          return of(null); // or you can return a default value if needed
        }),
      )
      .subscribe((response: any) => {
        this.productListData = Array.isArray(response?.data?.data)
          ? response.data.data
          : Array.isArray(response?.data)
            ? response.data
            : [];
        for (let i = 0; i < this.productListData.length; i++) {
          const element = this.productListData[i];
          if (String(element.id) === String(this.productId)) {
            this.selectedProduct = element;
            this.productPrice = element?.price_data?.regularPrice;
          }
        }
        this.loading = false;
        this.cd.detectChanges();
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

  toggleHeart(item: any) {
    const productId = item?.id || this.productDetails?.id;
    if (!productId) {
      return;
    }

    if (!this.validateVariantSelection('add this item to wishlist', false)) {
      this.variantSelectionError = 'Please select all required options before updating wishlist.';
      this.cd.detectChanges();
      return;
    }

    const data: any = {
      product_id: productId,
    };
    if (this.isVariableProduct && this.selectedVariantId !== null) {
      data.variant_id = this.selectedVariantId;
    }

    const previousState = !!item?.is_wishlisted;
    item.is_wishlisted = !previousState;

    this.dataService
      .post(data, 'wishlist/toggle')
      .pipe(
        catchError((err) => {
          item.is_wishlisted = previousState;
          this.globalService.showToast(err?.error || err);
          return of(err);
        })
      )
      .subscribe((res: any) => {
        if (res?.success) {
          if (typeof res?.data?.is_wishlisted === 'boolean') {
            item.is_wishlisted = res.data.is_wishlisted;
          }
          this.globalFunctionService.getCount();
          this.globalService.showToast(res);
          this.cd.detectChanges();
        } else if (res?.error?.message) {
          item.is_wishlisted = previousState;
          this.globalService.showToast(res.error);
        }
      });
  }

  // calculatePrice(){
  //   this.selectedProduct.price_data.regularPrice = this.productPrice * this.quantity;
  //   this.cd.detectChanges();
  // }

  private fetchProductDetails(identifier: any) {
    this.dataService
      .get(`products/${identifier}`)
      .pipe(
        catchError((error: any) => {
          this.globalService.showToast(error?.error || error);
          return of(null);
        })
      )
      .subscribe((res: any) => {
        const rawProduct = res?.data?.data ?? res?.data ?? null;
        if (!rawProduct) {
          return;
        }

        this.productDetails = rawProduct;
        this.selectedProduct = rawProduct;
        this.displayGalleryImages = this.getProductGalleryImages(rawProduct?.images);
        this.activeIndex = 0;
        this.selectedVariantPreviewImageUrl = '';
        this.isWishlisted = !!rawProduct?.is_wishlisted;
        this.shippingInfoSummary = this.buildShippingInfoSummary(rawProduct);

        const details = this.productDetails?.product_details;
        if (details) {
          this.safeShortDescription = this.sanitizer.bypassSecurityTrustHtml(
            details.shortDescription || ''
          );
          this.safeProductDescription = this.sanitizer.bypassSecurityTrustHtml(
            details.productDescription || ''
          );
          this.safeFeatures = this.sanitizer.bypassSecurityTrustHtml(details.features || '');
          this.safeContent = this.sanitizer.bypassSecurityTrustHtml(
            details.productDescriptionImageGallery || ''
          );
        }

        this.initializeVariantState();
        this.updateLoginState();
        this.cd.detectChanges();
      });
  }

  private initializeVariantState() {
    this.configurableOptions = this.extractConfigurableOptions(this.productDetails);
    this.productVariants = this.extractVariants(this.productDetails);
    this.selectedVariantOptions = {};
    this.selectedVariant = null;
    this.selectedVariantId = null;
    this.variantSelectionError = '';

    const hasVariantsFlagDefined =
      this.productDetails?.has_variants !== undefined &&
      this.productDetails?.has_variants !== null;
    const hasVariantsFlag = this.toBoolean(this.productDetails?.has_variants);

    if (hasVariantsFlagDefined) {
      this.isVariableProduct = hasVariantsFlag && this.productVariants.length > 0;
    } else {
      this.isVariableProduct =
        String(this.productDetails?.product_type || '').toLowerCase() === 'variable' ||
        this.configurableOptions.length > 0 ||
        this.productVariants.length > 0;
    }

    if (this.isVariableProduct && this.productVariants.length > 0) {
      this.applyDefaultVariantSelection();
      return;
    }

    this.updateDisplayPriceAndStock();
    this.syncVariantPreviewImage();
  }

  private applyDefaultVariantSelection() {
    const defaultVariant =
      this.productVariants.find((variant: any) => this.isVariantAvailable(variant)) ||
      this.productVariants[0] ||
      null;

    if (!defaultVariant) {
      this.updateDisplayPriceAndStock();
      return;
    }

    this.selectedVariant = defaultVariant;
    this.selectedVariantId = defaultVariant?.id ?? defaultVariant?.variant_id ?? null;
    this.selectedVariantOptions = this.buildSelectionFromVariant(defaultVariant);
    this.variantSelectionError = '';
    this.updateDisplayPriceAndStock();
    this.syncVariantPreviewImage();
  }

  private buildSelectionFromVariant(variant: any): Record<string, string> {
    const selectedOptions: Record<string, string> = {};
    if (!variant) {
      return selectedOptions;
    }

    const selectedIds = this.normalizeAttributeValueIds(variant?.attribute_value_ids).map((id) =>
      this.normalizeId(id)
    );

    if (selectedIds.length > 0) {
      this.configurableOptions.forEach((option: any) => {
        const optionKey = this.getOptionKey(option);
        const matchedValue = this.getOptionValues(option).find((value: any) =>
          selectedIds.includes(this.getOptionValueId(value))
        );
        if (matchedValue) {
          selectedOptions[optionKey] = this.getOptionValueId(matchedValue);
        }
      });
    }

    if (Object.keys(selectedOptions).length === 0 && Array.isArray(variant?.attributes_detail)) {
      variant.attributes_detail.forEach((detail: any) => {
        const attributeName = this.normalizeLookup(detail?.attribute_name ?? detail?.name);
        const valueName = this.normalizeLookup(detail?.value_name ?? detail?.value);
        if (attributeName === '' || valueName === '') {
          return;
        }

        const option = this.configurableOptions.find(
          (candidate: any) => this.normalizeLookup(this.getOptionName(candidate)) === attributeName
        );
        if (!option) {
          return;
        }

        const optionKey = this.getOptionKey(option);
        const matchedValue = this.getOptionValues(option).find(
          (value: any) => this.normalizeLookup(this.getOptionValueLabel(value)) === valueName
        );
        if (matchedValue) {
          selectedOptions[optionKey] = this.getOptionValueId(matchedValue);
        }
      });
    }

    return selectedOptions;
  }

  private updateLoginState() {
    let user: any = {};
    if (this.isBrowser) {
      user = JSON.parse(localStorage.getItem('user') || '{}');
    }

    if (typeof user === 'object' && Object.keys(user).length <= 0) {
      this.isLogin = false;
      return;
    }

    this.isLogin = true;
  }

  private buildShippingInfoSummary(product: any): {
    weightText: string | null;
    dimensionsText: string | null;
    shippingClassText: string | null;
  } {
    const shippingInfo = this.extractShippingInfo(product);

    if (!shippingInfo) {
      return {
        weightText: null,
        dimensionsText: null,
        shippingClassText: null,
      };
    }

    const weight = this.toNumber(shippingInfo?.weight);
    const length = this.toNumber(shippingInfo?.length);
    const width = this.toNumber(shippingInfo?.width);
    const height = this.toNumber(shippingInfo?.height);

    const dimensions = [
      { label: 'L', value: length },
      { label: 'W', value: width },
      { label: 'H', value: height },
    ].filter((item): item is { label: string; value: number } => item.value !== null);

    return {
      weightText: weight !== null ? `${this.formatShippingValue(weight)} g` : null,
      dimensionsText:
        dimensions.length > 0
          ? `${dimensions.map((item) => this.formatShippingValue(item.value)).join(' x ')} (${dimensions
              .map((item) => item.label)
              .join(' x ')})`
          : null,
      shippingClassText: this.hasDisplayValue(shippingInfo?.shippingClass)
        ? String(shippingInfo.shippingClass).trim()
        : null,
    };
  }

  private updateDisplayPriceAndStock() {
    const baseRegularPrice = this.toNumber(this.productDetails?.price_data?.regularPrice);
    const baseSalePrice = this.toNumber(this.productDetails?.price_data?.salePrice);
    const baseStock = this.toNumber(this.productDetails?.inventory?.manageStock);

    this.displayRegularPrice = baseRegularPrice;
    this.displaySalePrice = baseSalePrice ?? baseRegularPrice;
    this.displayStock = baseStock;

    if (this.selectedVariant) {
      const variantPrice = this.toNumber(this.selectedVariant?.price);
      const variantStock = this.toNumber(this.selectedVariant?.stock);

      this.displaySalePrice = variantPrice ?? this.displaySalePrice;
      this.displayStock = variantStock ?? this.displayStock;
    }
  }

  private resolveSelectedVariant() {
    const selectedIds = this.getSelectedValueIds();
    if (selectedIds.length === 0) {
      this.selectedVariant = null;
      this.selectedVariantId = null;
      this.updateDisplayPriceAndStock();
      this.syncVariantPreviewImage();
      this.cd.detectChanges();
      return;
    }

    const allSelected = this.areAllOptionsSelected();
    const matched = allSelected ? this.findMatchingVariant(selectedIds, true) : null;

    this.selectedVariant = matched;
    this.selectedVariantId = matched?.id ?? matched?.variant_id ?? null;

    if (allSelected && !matched) {
      this.variantSelectionError = 'Selected combination is unavailable.';
    } else if (matched && !this.isVariantAvailable(matched)) {
      this.variantSelectionError = 'Selected combination is out of stock.';
    } else {
      this.variantSelectionError = '';
    }

    this.updateDisplayPriceAndStock();
    this.syncVariantPreviewImage();
    this.cd.detectChanges();
  }

  private syncVariantPreviewImage() {
    const nextVariantPreviewImageUrl =
      this.productVariantService.resolveVariantImageUrl(this.selectedVariant, this.productDetails) || '';
    const hasPreviewChanged = this.selectedVariantPreviewImageUrl !== nextVariantPreviewImageUrl;

    this.selectedVariantPreviewImageUrl = nextVariantPreviewImageUrl;

    if (this.selectedVariantPreviewImageUrl && (hasPreviewChanged || this.activeIndex !== 0)) {
      this.activeIndex = 0;
      Promise.resolve().then(() => {
        this.navigateMainSlick(0);
      });
    }
  }

  private findMatchingVariant(selectedIds: string[], strict: boolean): any | null {
    if (!Array.isArray(this.productVariants) || this.productVariants.length === 0) {
      return null;
    }

    const normalizedSelection = selectedIds.map((id) => this.normalizeId(id));
    const exactMatch = this.productVariants.find((variant: any) => {
      const variantIds = this.normalizeAttributeValueIds(variant?.attribute_value_ids).map((id) =>
        this.normalizeId(id)
      );
      const variantSet = new Set(variantIds);
      const containsAll = normalizedSelection.every((id) => variantSet.has(id));
      if (!containsAll) {
        return false;
      }

      return strict ? variantSet.size === normalizedSelection.length : true;
    });

    return exactMatch || null;
  }

  private getSelectedValueIds(): string[] {
    return Object.values(this.selectedVariantOptions)
      .map((id) => this.normalizeId(id))
      .filter((id) => id !== '');
  }

  private areAllOptionsSelected(): boolean {
    if (!Array.isArray(this.configurableOptions) || this.configurableOptions.length === 0) {
      return false;
    }

    return this.configurableOptions.every((option: any) => {
      const optionKey = this.getOptionKey(option);
      return !!this.selectedVariantOptions[optionKey];
    });
  }

  private validateVariantSelection(actionLabel: string, withToast = true): boolean {
    if (!this.isVariableProduct) {
      return true;
    }

    if (!this.selectedVariantId) {
      this.variantSelectionError = 'Please select all required options.';
      if (withToast) {
        this.globalService.showToast({
          success: false,
          message: `Please select variant options before you ${actionLabel}.`,
        });
      }
      return false;
    }

    if (this.displayStock !== null && this.displayStock <= 0) {
      if (withToast) {
        this.globalService.showToast({
          success: false,
          message: 'Selected variant is out of stock.',
        });
      }
      return false;
    }

    return true;
  }

  private isVariantAvailable(variant: any): boolean {
    const isActive = variant?.is_active !== false;
    const stock = this.toNumber(variant?.stock);
    if (stock === null) {
      return isActive;
    }
    return isActive && stock > 0;
  }

  private isCurrentSelectionOutOfStock(): boolean {
    if (this.isVariableProduct) {
      if (this.selectedVariant && !this.isVariantAvailable(this.selectedVariant)) {
        return true;
      }
      return this.displayStock !== null && this.displayStock <= 0;
    }

    if (this.displayStock !== null && this.displayStock <= 0) {
      return true;
    }

    const stockStatus =
      this.productDetails?.inventory?.stockStatus ??
      this.productDetails?.inventory?.stock_status ??
      this.productDetails?.stockStatus ??
      this.productDetails?.stock_status;
    return this.isOutOfStockStatus(stockStatus);
  }

  private isOutOfStockStatus(status: any): boolean {
    const normalized = this.normalizeLookup(status);
    return (
      normalized === 'out_of_stock' ||
      normalized === 'out of stock' ||
      normalized === 'outofstock' ||
      normalized === 'sold_out' ||
      normalized === 'sold out' ||
      normalized === 'oos'
    );
  }

  private extractConfigurableOptions(product: any): any[] {
    const candidates = [
      product?.configurable_options,
      product?.attributes?.configurable_options,
      product?.options,
    ];

    for (const candidate of candidates) {
      const parsed = this.parseCollectionCandidate(candidate);
      if (!Array.isArray(parsed) || parsed.length === 0) {
        continue;
      }

      const normalized = parsed
        .map((option: any, index: number) => this.normalizeConfigurableOption(option, index))
        .filter((option: any) => option.values.length > 0);
      if (normalized.length > 0) {
        return normalized;
      }
    }

    return [];
  }

  private extractShippingInfo(product: any): any | null {
    const candidates = [product?.shipping_info, product?.product_details?.shipping_info];

    for (const candidate of candidates) {
      if (!candidate) {
        continue;
      }

      if (typeof candidate === 'string') {
        try {
          const parsed = JSON.parse(candidate);
          if (parsed && typeof parsed === 'object') {
            return parsed;
          }
        } catch (error) {
          continue;
        }
      }

      if (typeof candidate === 'object') {
        return candidate;
      }
    }

    return null;
  }

  private normalizeConfigurableOption(option: any, index: number) {
    const valuesSource = this.parseCollectionCandidate(
      option?.values ?? option?.options ?? option?.attribute_values ?? option?.data
    );

    const values = valuesSource
      .map((value: any, valueIndex: number) => ({
        id:
          value?.id ??
          value?.value_id ??
          value?.attribute_value_id ??
          value?.value ??
          `${option?.id || option?.name || index}_${valueIndex}`,
        label: String(value?.label ?? value?.value ?? value?.name ?? value?.text ?? ''),
        meta: value?.meta ?? value?.hex ?? value?.color ?? null,
      }))
      .filter((value: any) => value.label !== '');

    const uniqueValueMap = new Map<string, any>();
    values.forEach((value: any) => {
      uniqueValueMap.set(this.normalizeId(value.id), value);
    });

    return {
      key: this.normalizeId(option?.attribute_id ?? option?.id ?? option?.name ?? `option_${index}`),
      name: option?.attribute_name ?? option?.name ?? option?.label ?? `Option ${index + 1}`,
      values: Array.from(uniqueValueMap.values()),
    };
  }

  private extractVariants(product: any): any[] {
    const candidates = [
      product?.variants,
      product?.variant,
      product?.product_details?.variants,
      product?.attributes?.variants,
    ];

    for (const candidate of candidates) {
      const parsed = this.parseCollectionCandidate(candidate);
      if (!Array.isArray(parsed) || parsed.length === 0) {
        continue;
      }

      return parsed.map((variant: any, index: number) => this.normalizeVariant(variant, index));
    }

    return [];
  }

  private normalizeVariant(variant: any, _index: number) {
    const normalizedIds = this.normalizeAttributeValueIds(variant?.attribute_value_ids);
    const details = Array.isArray(variant?.attributes_detail) ? variant.attributes_detail : [];
    const variantDisplayName = this.productVariantService.getSelectedVariantDisplayName({
      ...variant,
      attributes_detail: details,
    });

    return {
      ...variant,
      id: variant?.id ?? variant?.variant_id ?? null,
      variant_name: variantDisplayName,
      attribute_value_ids: normalizedIds,
      price: this.toNumber(variant?.price),
      stock: this.toNumber(variant?.stock),
      is_active: variant?.is_active ?? true,
      attributes_detail: details,
    };
  }

  private parseCollectionCandidate(candidate: any): any[] {
    if (Array.isArray(candidate)) {
      return candidate;
    }

    if (candidate && Array.isArray(candidate.data)) {
      return candidate.data;
    }

    if (candidate && candidate.data !== undefined) {
      const nested = this.parseCollectionCandidate(candidate.data);
      if (nested.length > 0) {
        return nested;
      }
    }

    if (typeof candidate === 'string') {
      try {
        const parsed = JSON.parse(candidate);
        return this.parseCollectionCandidate(parsed);
      } catch (error) {
        return [];
      }
    }

    return [];
  }

  private getProductGalleryImages(images: any): any[] {
    if (!Array.isArray(images)) {
      return [];
    }

    return images.filter((image: any) => this.normalizeLookup(image?.type) !== 'variant');
  }

  private normalizeAttributeValueIds(rawValue: any): any[] {
    if (Array.isArray(rawValue)) {
      return rawValue;
    }

    if (typeof rawValue === 'string') {
      const trimmed = rawValue.trim();
      if (trimmed === '') {
        return [];
      }

      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      } catch (error) {
        return trimmed.split(',').map((item) => item.trim()).filter((item) => item !== '');
      }
    }

    if (rawValue !== undefined && rawValue !== null && rawValue !== '') {
      return [rawValue];
    }

    return [];
  }

  private toNumber(value: any): number | null {
    if (value === null || value === undefined || value === '') {
      return null;
    }

    const parsed = Number(value);
    return Number.isNaN(parsed) ? null : parsed;
  }

  private formatShippingValue(value: number): string {
    return Number.isInteger(value) ? String(value) : value.toFixed(2).replace(/\.?0+$/, '');
  }

  private hasDisplayValue(value: any): boolean {
    return value !== null && value !== undefined && String(value).trim() !== '';
  }

  private toBoolean(value: any): boolean {
    if (typeof value === 'boolean') {
      return value;
    }
    if (typeof value === 'number') {
      return value === 1;
    }
    const normalized = String(value ?? '').trim().toLowerCase();
    return normalized === 'true' || normalized === '1' || normalized === 'yes';
  }

  private normalizeId(value: any): string {
    if (value === null || value === undefined) {
      return '';
    }
    return String(value).trim();
  }

  private normalizeLookup(value: any): string {
    return String(value ?? '').trim().toLowerCase();
  }

  private getOptionKey(option: any): string {
    return this.normalizeId(option?.key ?? option?.attribute_id ?? option?.id ?? option?.name);
  }

  private getOptionValueId(value: any): string {
    return this.normalizeId(
      value?.id ?? value?.value_id ?? value?.attribute_value_id ?? value?.value ?? value?.name
    );
  }

  back() {
    if (this.isBrowser) {
      window.history.back();
    }
  }
}
