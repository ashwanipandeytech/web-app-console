import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ProductVariantService {
  isVariantProduct(product: any): boolean {
    const hasVariantsFlagDefined =
      product?.has_variants !== undefined && product?.has_variants !== null;

    if (hasVariantsFlagDefined) {
      return this.toBoolean(product?.has_variants);
    }

    return (
      String(product?.product_type || '').toLowerCase() === 'variable' ||
      this.extractConfigurableOptions(product).length > 0 ||
      this.extractVariants(product).length > 0
    );
  }

  initializeVariantState(product: any) {
    const configurableOptions = this.extractConfigurableOptions(product);
    const productVariants = this.extractVariants(product);
    let selectedVariantOptions: Record<string, string> = {};
    let selectedVariant: any = null;
    let selectedVariantId: number | string | null = null;

    const hasVariantsFlagDefined =
      product?.has_variants !== undefined && product?.has_variants !== null;
    const hasVariantsFlag = this.toBoolean(product?.has_variants);

    let isVariableProduct = false;
    if (hasVariantsFlagDefined) {
      isVariableProduct = hasVariantsFlag && productVariants.length > 0;
    } else {
      isVariableProduct =
        String(product?.product_type || '').toLowerCase() === 'variable' ||
        configurableOptions.length > 0 ||
        productVariants.length > 0;
    }

    if (isVariableProduct && productVariants.length > 0) {
      const defaultSelection = this.getDefaultVariantSelection(configurableOptions, productVariants);
      selectedVariant = defaultSelection.selectedVariant;
      selectedVariantId = defaultSelection.selectedVariantId;
      selectedVariantOptions = defaultSelection.selectedVariantOptions;
    }

    return {
      configurableOptions,
      productVariants,
      selectedVariantOptions,
      selectedVariant,
      selectedVariantId,
      isVariableProduct,
      variantSelectionError: '',
      ...this.getDisplayPriceAndStock(product, selectedVariant),
    };
  }

  getDisplayPriceAndStock(product: any, selectedVariant: any) {
    const baseRegularPrice = this.toNumber(product?.price_data?.regularPrice);
    const baseSalePrice = this.toNumber(product?.price_data?.salePrice);
    const baseStock = this.toNumber(product?.inventory?.manageStock);

    let displayRegularPrice = baseRegularPrice;
    let displaySalePrice = baseSalePrice ?? baseRegularPrice;
    let displayStock = baseStock;

    if (selectedVariant) {
      const variantPrice = this.toNumber(selectedVariant?.price);
      const variantStock = this.toNumber(selectedVariant?.stock);

      displaySalePrice = variantPrice ?? displaySalePrice;
      displayStock = variantStock ?? displayStock;
    }

    return {
      displayRegularPrice,
      displaySalePrice,
      displayStock,
    };
  }

  resolveSelectedVariant(
    product: any,
    configurableOptions: any[],
    productVariants: any[],
    selectedVariantOptions: Record<string, string>,
  ) {
    const selectedIds = this.getSelectedValueIds(selectedVariantOptions);
    if (selectedIds.length === 0) {
      return {
        selectedVariant: null,
        selectedVariantId: null,
        variantSelectionError: '',
        ...this.getDisplayPriceAndStock(product, null),
      };
    }

    const allSelected = this.areAllOptionsSelected(configurableOptions, selectedVariantOptions);
    const matched = allSelected ? this.findMatchingVariant(productVariants, selectedIds, true) : null;

    let variantSelectionError = '';
    if (allSelected && !matched) {
      variantSelectionError = 'Selected combination is unavailable.';
    } else if (matched && !this.isVariantAvailable(matched)) {
      variantSelectionError = 'Selected combination is out of stock.';
    }

    return {
      selectedVariant: matched,
      selectedVariantId: matched?.id ?? matched?.variant_id ?? null,
      variantSelectionError,
      ...this.getDisplayPriceAndStock(product, matched),
    };
  }

  toggleVariantOptionSelection(
    option: any,
    value: any,
    selectedVariantOptions: Record<string, string>,
  ) {
    const optionKey = this.getOptionKey(option);
    const valueId = this.getOptionValueId(value);

    if (!optionKey || !valueId) {
      return selectedVariantOptions;
    }

    const nextSelection = { ...selectedVariantOptions };
    if (nextSelection[optionKey] === valueId) {
      delete nextSelection[optionKey];
    } else {
      nextSelection[optionKey] = valueId;
    }

    return nextSelection;
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

  getOptionKey(option: any): string {
    return this.normalizeId(option?.key ?? option?.attribute_id ?? option?.id ?? option?.name);
  }

  getOptionValueId(value: any): string {
    return this.normalizeId(
      value?.id ?? value?.value_id ?? value?.attribute_value_id ?? value?.value ?? value?.name,
    );
  }

  isVariantOptionSelected(
    option: any,
    value: any,
    selectedVariantOptions: Record<string, string>,
  ): boolean {
    const optionKey = this.getOptionKey(option);
    const valueId = this.getOptionValueId(value);
    return selectedVariantOptions[optionKey] === valueId;
  }

  isVariantOptionDisabled(
    option: any,
    value: any,
    selectedVariantOptions: Record<string, string>,
    productVariants: any[],
    isVariableProduct: boolean,
  ): boolean {
    if (!isVariableProduct || productVariants.length === 0) {
      return false;
    }

    const optionKey = this.getOptionKey(option);
    const valueId = this.getOptionValueId(value);
    const testSelection = { ...selectedVariantOptions, [optionKey]: valueId };
    const selectedIds = Object.values(testSelection).filter((id) => id !== '');

    return !productVariants.some((variant: any) => {
      if (!this.isVariantAvailable(variant)) {
        return false;
      }

      const variantIdSet = new Set(
        this.normalizeAttributeValueIds(variant?.attribute_value_ids).map((id) =>
          this.normalizeId(id),
        ),
      );

      return selectedIds.every((id) => variantIdSet.has(this.normalizeId(id)));
    });
  }

  isVariantAvailable(variant: any): boolean {
    const isActive = variant?.is_active !== false;
    const stock = this.toNumber(variant?.stock);
    if (stock === null) {
      return isActive;
    }
    return isActive && stock > 0;
  }

  isCurrentSelectionOutOfStock(
    product: any,
    isVariableProduct: boolean,
    selectedVariant: any,
    displayStock: number | null,
  ): boolean {
    if (isVariableProduct) {
      if (selectedVariant && !this.isVariantAvailable(selectedVariant)) {
        return true;
      }

      return displayStock !== null && displayStock <= 0;
    }

    if (displayStock !== null && displayStock <= 0) {
      return true;
    }

    const stockStatus =
      product?.inventory?.stockStatus ??
      product?.inventory?.stock_status ??
      product?.stockStatus ??
      product?.stock_status;

    return this.isOutOfStockStatus(stockStatus);
  }

  extractConfigurableOptions(product: any): any[] {
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

  extractVariants(product: any): any[] {
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

  buildSelectionFromVariant(variant: any, configurableOptions: any[]): Record<string, string> {
    const selectedOptions: Record<string, string> = {};
    if (!variant) {
      return selectedOptions;
    }

    const selectedIds = this.normalizeAttributeValueIds(variant?.attribute_value_ids).map((id) =>
      this.normalizeId(id),
    );

    if (selectedIds.length > 0) {
      configurableOptions.forEach((option: any) => {
        const optionKey = this.getOptionKey(option);
        const matchedValue = this.getOptionValues(option).find((value: any) =>
          selectedIds.includes(this.getOptionValueId(value)),
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

        const option = configurableOptions.find(
          (candidate: any) => this.normalizeLookup(this.getOptionName(candidate)) === attributeName,
        );

        if (!option) {
          return;
        }

        const optionKey = this.getOptionKey(option);
        const matchedValue = this.getOptionValues(option).find(
          (value: any) => this.normalizeLookup(this.getOptionValueLabel(value)) === valueName,
        );

        if (matchedValue) {
          selectedOptions[optionKey] = this.getOptionValueId(matchedValue);
        }
      });
    }

    return selectedOptions;
  }

  private getDefaultVariantSelection(configurableOptions: any[], productVariants: any[]) {
    const defaultVariant =
      productVariants.find((variant: any) => this.isVariantAvailable(variant)) ||
      productVariants[0] ||
      null;

    return {
      selectedVariant: defaultVariant,
      selectedVariantId: defaultVariant?.id ?? defaultVariant?.variant_id ?? null,
      selectedVariantOptions: this.buildSelectionFromVariant(defaultVariant, configurableOptions),
    };
  }

  private findMatchingVariant(productVariants: any[], selectedIds: string[], strict: boolean): any | null {
    if (!Array.isArray(productVariants) || productVariants.length === 0) {
      return null;
    }

    const normalizedSelection = selectedIds.map((id) => this.normalizeId(id));
    const exactMatch = productVariants.find((variant: any) => {
      const variantIds = this.normalizeAttributeValueIds(variant?.attribute_value_ids).map((id) =>
        this.normalizeId(id),
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

  private getSelectedValueIds(selectedVariantOptions: Record<string, string>): string[] {
    return Object.values(selectedVariantOptions)
      .map((id) => this.normalizeId(id))
      .filter((id) => id !== '');
  }

  private areAllOptionsSelected(
    configurableOptions: any[],
    selectedVariantOptions: Record<string, string>,
  ): boolean {
    if (!Array.isArray(configurableOptions) || configurableOptions.length === 0) {
      return false;
    }

    return configurableOptions.every((option: any) => {
      const optionKey = this.getOptionKey(option);
      return !!selectedVariantOptions[optionKey];
    });
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

  private normalizeConfigurableOption(option: any, index: number) {
    const valuesSource = this.parseCollectionCandidate(
      option?.values ?? option?.options ?? option?.attribute_values ?? option?.data,
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

  private normalizeVariant(variant: any, index: number) {
    const normalizedIds = this.normalizeAttributeValueIds(variant?.attribute_value_ids);
    const details = Array.isArray(variant?.attributes_detail) ? variant.attributes_detail : [];
    const detailName = details
      .map((item: any) => item?.value_name || item?.value)
      .filter((value: any) => !!value)
      .join(' - ');

    return {
      ...variant,
      id: variant?.id ?? variant?.variant_id ?? null,
      variant_name:
        variant?.variant_name || detailName || variant?.sku_suffix || `Variant ${index + 1}`,
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
        return trimmed
          .split(',')
          .map((item) => item.trim())
          .filter((item) => item !== '');
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
}
