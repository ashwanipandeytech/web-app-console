import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ChangeDetectorRef, Component, Input, PLATFORM_ID, inject } from '@angular/core';
import { catchError, of } from 'rxjs';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { DataService } from '../../services/data-service';
import { GlobaCommonlService } from '../../services/global-common.service';
import { GlobalFunctionService } from '../../services/global-function.service';
import { ProductVariantService } from '../../services/product-variant.service';

@Component({
  selector: 'app-product-variant-cart-modal',
  imports: [CommonModule],
  templateUrl: './product-variant-cart-modal.component.html',
  styleUrl: './product-variant-cart-modal.component.scss',
})
export class ProductVariantCartModalComponent {
  @Input() product: any;

  private readonly cd = inject(ChangeDetectorRef);
  private readonly dataService = inject(DataService);
  private readonly globalService = inject(GlobaCommonlService);
  private readonly globalFunctionService = inject(GlobalFunctionService);
  private readonly productVariantService = inject(ProductVariantService);
  readonly activeModal = inject(NgbActiveModal);
  private readonly platformId = inject(PLATFORM_ID);

  productDetails: any = null;
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
  loading = false;
  hasVariantRequirement = false;
  isBrowser: boolean;

  constructor() {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit() {
    this.hasVariantRequirement = this.productVariantService.isVariantProduct(this.product);

    if (!this.product?.id) {
      this.globalService.showToast({
        success: false,
        message: 'Unable to load variant options right now.',
      });
      this.activeModal.dismiss();
      return;
    }

    this.applyVariantState(this.product, false);
    this.loadProductDetails(this.product.id);
  }

  get productImageUrl(): string {
    return this.productVariantService.getProductDisplayImageUrl(
      this.productDetails || this.product,
      this.selectedVariant,
    );
  }

  get availabilityText(): string {
    if (this.loading) {
      return 'Loading variant options...';
    }

    if (this.hasVariantRequirement && !this.isVariableProduct) {
      return 'Variant options are unavailable right now.';
    }

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

  get shouldDisableAddToCart(): boolean {
    if (this.loading) {
      return true;
    }

    if (this.hasVariantRequirement && !this.isVariableProduct) {
      return true;
    }

    if (this.isVariableProduct && !this.selectedVariantId) {
      return true;
    }

    return this.isCurrentSelectionOutOfStock();
  }

  get selectedVariantDisplayName(): string {
    return this.productVariantService.getSelectedVariantDisplayName(
      this.selectedVariant,
      this.configurableOptions,
      this.selectedVariantOptions,
    );
  }

  getOptionName(option: any): string {
    return this.productVariantService.getOptionName(option);
  }

  getOptionValues(option: any): any[] {
    return this.productVariantService.getOptionValues(option);
  }

  getOptionValueLabel(value: any): string {
    return this.productVariantService.getOptionValueLabel(value);
  }

  isVariantOptionSelected(option: any, value: any): boolean {
    return this.productVariantService.isVariantOptionSelected(
      option,
      value,
      this.selectedVariantOptions,
    );
  }

  isVariantOptionDisabled(option: any, value: any): boolean {
    return this.productVariantService.isVariantOptionDisabled(
      option,
      value,
      this.selectedVariantOptions,
      this.productVariants,
      this.isVariableProduct,
    );
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

  addToCart() {
    const productId = this.productDetails?.id || this.product?.id;
    if (!productId) {
      this.globalService.showToast({
        success: false,
        message: 'Unable to add this product to cart right now.',
      });
      return;
    }

    if (this.hasVariantRequirement && !this.isVariableProduct) {
      this.globalService.showToast({
        success: false,
        message: 'Variant options are unavailable right now. Please try again later.',
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

    if (!this.validateVariantSelection()) {
      return;
    }

    let guestToken: any = null;
    if (this.isBrowser) {
      guestToken = JSON.parse(localStorage.getItem('GUEST_TOKEN') || 'null');
    }

    const cartPayload: any = {
      product_id: productId,
      quantity: 1,
      guest_token: guestToken,
    };

    if (this.isVariableProduct && this.selectedVariantId !== null) {
      cartPayload.variant_id = this.selectedVariantId;
    }

    this.dataService
      .post(cartPayload, 'cart')
      .pipe(
        catchError((error) => {
          this.globalService.showToast(error?.error || error);
          return of(null);
        }),
      )
      .subscribe((res: any) => {
        if (!res) {
          return;
        }

        if (res.success === true) {
          this.globalFunctionService.getCount();
          this.globalService.showToast(res);
          this.activeModal.close({
            addedToCart: true,
            closedBy: 'add_to_cart',
            variantId: this.selectedVariantId,
            variantImageUrl: this.productImageUrl,
          });
        } else if (res.error?.message) {
          this.globalService.showToast(res.error);
        }
      });
  }

  closeWithSelection(action: 'close' | 'cancel' = 'close') {
    this.activeModal.close({
      addedToCart: false,
      closedBy: action,
      variantId: this.selectedVariantId,
      variantImageUrl: this.productImageUrl,
    });
  }

  private loadProductDetails(identifier: number | string) {
    this.loading = true;
    this.cd.detectChanges();

    this.dataService
      .get(`products/${identifier}`)
      .pipe(
        catchError((error: any) => {
          this.loading = false;
          this.globalService.showToast(error?.error || error);
          this.cd.detectChanges();
          return of(null);
        }),
      )
      .subscribe((res: any) => {
        const rawProduct = res?.data?.data ?? res?.data ?? null;
        if (rawProduct) {
          this.applyVariantState(rawProduct, true);
        }

        this.loading = false;
        this.cd.detectChanges();
      });
  }

  private applyVariantState(product: any, trustResolvedProduct: boolean) {
    this.productDetails = product;

    const variantState = this.productVariantService.initializeVariantState(product);
    this.configurableOptions = variantState.configurableOptions;
    this.productVariants = variantState.productVariants;
    this.selectedVariantOptions = variantState.selectedVariantOptions;
    this.selectedVariant = variantState.selectedVariant;
    this.selectedVariantId = variantState.selectedVariantId;
    this.isVariableProduct = variantState.isVariableProduct;
    this.variantSelectionError = variantState.variantSelectionError;
    this.displayRegularPrice = variantState.displayRegularPrice;
    this.displaySalePrice = variantState.displaySalePrice;
    this.displayStock = variantState.displayStock;

    if (trustResolvedProduct) {
      this.hasVariantRequirement = variantState.isVariableProduct;
    }
  }

  private resolveSelectedVariant() {
    const resolved = this.productVariantService.resolveSelectedVariant(
      this.productDetails,
      this.configurableOptions,
      this.productVariants,
      this.selectedVariantOptions,
    );

    this.selectedVariant = resolved.selectedVariant;
    this.selectedVariantId = resolved.selectedVariantId;
    this.variantSelectionError = resolved.variantSelectionError;
    this.displayRegularPrice = resolved.displayRegularPrice;
    this.displaySalePrice = resolved.displaySalePrice;
    this.displayStock = resolved.displayStock;
    this.cd.detectChanges();
  }

  private validateVariantSelection(): boolean {
    if (!this.isVariableProduct) {
      return true;
    }

    if (!this.selectedVariantId) {
      this.variantSelectionError = 'Please select all required options.';
      this.globalService.showToast({
        success: false,
        message: 'Please select variant options before adding this item to cart.',
      });
      this.cd.detectChanges();
      return false;
    }

    if (this.displayStock !== null && this.displayStock <= 0) {
      this.globalService.showToast({
        success: false,
        message: 'Selected variant is out of stock.',
      });
      return false;
    }

    return true;
  }

  private isCurrentSelectionOutOfStock(): boolean {
    return this.productVariantService.isCurrentSelectionOutOfStock(
      this.productDetails || this.product,
      this.isVariableProduct,
      this.selectedVariant,
      this.displayStock,
    );
  }
}
