import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, inject } from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { catchError, finalize, of } from 'rxjs';
import { DataService } from 'shared-lib/services/data-service';

@Component({
  selector: 'app-order-detail-modal',
  standalone: true,
  imports: [CommonModule, DatePipe, DecimalPipe],
  templateUrl: './order-detail-modal.component.html',
  styleUrl: './order-detail-modal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderDetailModalComponent {
  private readonly dataService = inject(DataService);
  private readonly cd = inject(ChangeDetectorRef);

  readonly activeModal = inject(NgbActiveModal);

  orderData: any = null;
  isLoading = false;
  loadError = '';
  private loadedOrderId: number | string | null = null;

  @Input() set order(value: any) {
    this.orderData = value;

    const orderId = value?.id;
    if (orderId && this.loadedOrderId !== orderId) {
      this.fetchOrderDetail(orderId);
    }
  }

  get orderItems(): any[] {
    return Array.isArray(this.orderData?.items) ? this.orderData.items : [];
  }

  close(): void {
    this.activeModal.dismiss('close');
  }

  getOrderNumber(): string | number {
    return this.firstPresent([
      this.orderData?.summary?.order_number,
      this.orderData?.order_number,
      this.orderData?.id,
    ]) as string | number;
  }

  getCustomerName(): string {
    return this.asText(
      this.firstPresent([
        this.orderData?.user?.name,
        this.orderData?.customer?.name,
        this.orderData?.address?.name,
        this.orderData?.customer_name,
      ]),
      '-'
    );
  }

  getCustomerEmail(): string {
    return this.asText(
      this.firstPresent([
        this.orderData?.user?.email,
        this.orderData?.customer?.email,
        this.orderData?.email,
      ]),
      '-'
    );
  }

  getCustomerPhone(): string {
    return this.asText(
      this.firstPresent([
        this.getPrimaryAddress()?.phone,
        this.orderData?.user?.phone,
        this.orderData?.customer?.phone,
        this.orderData?.phone,
      ]),
      '-'
    );
  }

  getAddressLines(): string[] {
    const address = this.getPrimaryAddress();
    if (!address) {
      return [];
    }

    const lineOne = [address.house_no, address.street, address.address_line1, address.address1]
      .map((value: unknown) => this.asText(value))
      .filter(Boolean)
      .join(', ');

    const lineTwo = [
      address.locality,
      address.city,
      address.state,
      address.pincode ?? address.postal_code ?? address.zip_code,
    ]
      .map((value: unknown) => this.asText(value))
      .filter(Boolean)
      .join(', ');

    const lineThree = this.asText(address.country);

    return [lineOne, lineTwo, lineThree].filter(Boolean);
  }

  getStatusLabel(status: unknown): string {
    const normalized = this.normalizeStatus(status);
    const labels: Record<string, string> = {
      pending: 'Pending',
      confirmed: 'Confirmed',
      processing: 'Processing',
      dispatched: 'Dispatched',
      shipped: 'Shipped',
      out_for_delivery: 'Out for Delivery',
      delivered: 'Delivered',
      cancelled: 'Cancelled',
      return_requested: 'Return Requested',
      return_approved: 'Return Approved',
      return_picked_up: 'Return Picked Up',
      return_rejected: 'Return Rejected',
      returned: 'Returned',
    };

    return labels[normalized] || this.formatLabel(status);
  }

  getStatusClass(status: unknown): string {
    const normalized = this.normalizeStatus(status);

    if (['cancelled', 'return_requested', 'return_approved', 'return_picked_up', 'return_rejected', 'returned'].includes(normalized)) {
      return 'status-danger';
    }

    if (normalized === 'delivered') {
      return 'status-success';
    }

    if (normalized === 'pending') {
      return 'status-pending';
    }

    return 'status-info';
  }

  getItemName(item: any): string {
    return this.asText(
      this.firstPresent([
        item?.product?.title,
        item?.title,
        item?.name,
      ]),
      'Product'
    );
  }

  getItemQuantity(item: any): number {
    const quantity = this.firstNumber([
      item?.quantity,
      item?.qty,
      item?.pivot?.quantity,
      item?.order_quantity,
    ]);

    return quantity && quantity > 0 ? quantity : 1;
  }

  getItemPrice(item: any): number {
    return (
      this.firstNumber([
        item?.price,
        item?.unit_price,
        item?.amount,
        item?.product?.price_data?.salePrice,
        item?.product?.price_data?.regularPrice,
      ]) ?? 0
    );
  }

  getItemTotal(item: any): number {
    return (
      this.firstNumber([
        item?.total,
        item?.line_total,
        item?.subtotal,
        item?.amount_total,
      ]) ?? this.getItemPrice(item) * this.getItemQuantity(item)
    );
  }

  getPaymentMethod(): string {
    return this.formatLabel(
      this.firstPresent([
        this.orderData?.payment_method,
        this.orderData?.payment_details?.payment_gateway,
      ])
    );
  }

  getOrderSubtotal(): number {
    return (
      this.firstNumber([
        this.orderData?.subtotal,
        this.orderData?.sub_total,
      ]) ?? this.orderItems.reduce((total, item) => total + this.getItemTotal(item), 0)
    );
  }

  getDiscountAmount(): number {
    return (
      this.firstNumber([
        this.orderData?.coupon_discount,
        this.orderData?.discount_amount,
      ]) ?? 0
    );
  }

  getShippingAmount(): number {
    return (
      this.firstNumber([
        this.orderData?.shipping_amount,
        this.orderData?.shipping_charge,
        this.orderData?.delivery_charge,
      ]) ?? 0
    );
  }

  getOrderTotal(): number {
    return (
      this.firstNumber([
        this.orderData?.total_amount,
        this.orderData?.grand_total,
        this.orderData?.summary?.total_amount,
      ]) ?? this.getOrderSubtotal() + this.getShippingAmount() - this.getDiscountAmount()
    );
  }

  getTransactionId(): string {
    return this.asText(this.orderData?.payment_details?.transaction_id, '-');
  }

  private fetchOrderDetail(orderId: number | string): void {
    this.loadedOrderId = orderId;
    this.isLoading = true;
    this.loadError = '';
    this.cd.markForCheck();

    this.dataService
      .getById('orders', orderId)
      .pipe(
        catchError((error) => {
          console.error('Failed to load order details:', error);
          this.loadError = 'Showing the available order data because the latest details could not be loaded.';
          return of(null);
        }),
        finalize(() => {
          this.isLoading = false;
          this.cd.markForCheck();
        })
      )
      .subscribe((response: any) => {
        const detail = response?.data?.data ?? response?.data;
        if (!detail) {
          return;
        }

        this.orderData = {
          ...this.orderData,
          ...detail,
          items:
            Array.isArray(detail?.items) && detail.items.length > 0
              ? detail.items
              : this.orderItems,
        };
        this.cd.markForCheck();
      });
  }

  private getPrimaryAddress(): any {
    return (
      this.orderData?.address ||
      this.orderData?.shipping_address ||
      this.orderData?.billing_address ||
      this.orderData?.user?.address ||
      null
    );
  }

  private normalizeStatus(status: unknown): string {
    return String(status ?? '')
      .trim()
      .toLowerCase()
      .replace(/[\s-]+/g, '_');
  }

  private formatLabel(value: unknown): string {
    const text = this.asText(value, '-');
    if (text === '-') {
      return text;
    }

    return text
      .replace(/[_-]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .replace(/\b\w/g, (character) => character.toUpperCase());
  }

  private firstPresent(candidates: unknown[]): unknown {
    for (const candidate of candidates) {
      if (candidate === 0 || candidate === false) {
        return candidate;
      }

      if (candidate !== null && candidate !== undefined && String(candidate).trim() !== '') {
        return candidate;
      }
    }

    return null;
  }

  private firstNumber(candidates: unknown[]): number | null {
    for (const candidate of candidates) {
      if (candidate === null || candidate === undefined || candidate === '') {
        continue;
      }

      const parsedValue = Number(candidate);
      if (Number.isFinite(parsedValue)) {
        return parsedValue;
      }
    }

    return null;
  }

  private asText(value: unknown, fallback = ''): string {
    if (value === null || value === undefined) {
      return fallback;
    }

    const text = String(value).trim();
    return text || fallback;
  }
}
