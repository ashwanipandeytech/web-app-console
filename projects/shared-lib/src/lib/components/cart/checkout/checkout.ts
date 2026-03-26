import { ChangeDetectorRef, Component, effect, ElementRef, inject, Inject, PLATFORM_ID, ViewChild, TemplateRef } from '@angular/core';
import { DataService } from '../../../services/data-service';
import { catchError, map, of } from 'rxjs';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RazorpayService } from '../../../services/payment-razor';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { GlobaCommonlService } from '../../../services/global-common.service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { GlobalFunctionService } from '../../../services/global-function.service';
import { SignalService } from '../../../services/signal-service';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'web-checkout',
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterLink],
  templateUrl: './checkout.html',
  styleUrl: './checkout.scss'
})
export class Checkout {
  @ViewChild('changedModal') changedModal!: TemplateRef<any>;
  @ViewChild('deleteCart') deleteCart!: TemplateRef<any>;
  @ViewChild('couponModal') couponModal!: TemplateRef<any>;
  
  private ngbModal = inject(NgbModal);
  private modalRef?: NgbModalRef;
  private couponModalRef?: NgbModalRef;
  private changedModalRef?: NgbModalRef;
  private dataService = inject(DataService);
  private globalFunctionService = inject(GlobalFunctionService);
  private router = inject(Router);
  private globalService = inject(GlobaCommonlService);
  public signalService = inject(SignalService);
  private http = inject(HttpClient);
  private cd = inject(ChangeDetectorRef);
  private fb = inject(FormBuilder);
  cartListData: any = {};
  grandTotal = 0;
  subTotal: any = 0;
  checkoutForm!: FormGroup;
  public razorpayService: any = inject(RazorpayService);
  countries: any = [];
  cities: any = [];
  states: any;
  email: any;
  selectedPaymentMethod: any = 'cod';
  isSelectPaymentMethodInput: boolean = true;
  fullAddrress: any = {};
  addressListData: any;
  AllAddressList: any;
  changedSelectedAddress: any;
  addressNotfound: boolean = false;
  appliedCoupon: any = '';
  gstSummary: any = {};
  isLoading: boolean = true;
  isBrowser: boolean;
  private platformId = inject(PLATFORM_ID);
  private activateRoute = inject(ActivatedRoute);
  cartItemId: any;
  constructor() {
    this.isBrowser = isPlatformBrowser(this.platformId);
    this.appliedCoupon = localStorage.getItem('appliedCoupon') || '';
    // this.checkCoupon(this.appliedCoupon);
    effect(() => {
      if (this.signalService.userLoggedIn()) {

        this.initializeData();

        this.cd.detectChanges();
      }

    });
  }

  ngOnInit() {

    this.initializeData()
    let isLoggedIn: any = null;
    if (this.isBrowser) {
      isLoggedIn = JSON.parse(localStorage.getItem('isLoggedIn') || 'null');
    }

    if (!isLoggedIn) {

      this.signalService.openLoginPopup.set(true)
      return;

    }


  }
  initializeData() {
    if (this.isBrowser) {
      let userString: any = localStorage.getItem('user'); // this is a string
      if (userString) {
        let userObj = JSON.parse(userString);            // convert to object
        this.email = userObj.user.email;                  // access email
        //console.log('Email:', this.email);
      }
    }


    this.createCheckoutBillingForm();
    this.carList();
    this.loadCountries();
    this.getAddressList();
  }

  private toNumber(value: any): number | null {
    if (value === null || value === undefined || value === '') {
      return null;
    }
    const parsed = Number(value);
    return Number.isNaN(parsed) ? null : parsed;
  }

  private isVariableProductItem(item: any): boolean {
    const productType = String(item?.product?.product_type || item?.product_type || '').toLowerCase();
    return (
      productType === 'variable' ||
      item?.variant_id !== undefined ||
      item?.variant !== undefined ||
      item?.variant_details !== undefined
    );
  }

  getCartItemVariantId(item: any): number | string | null {
    const candidates = [
      item?.variant_id,
      item?.variant?.id,
      item?.variant?.variant_id,
      item?.variant_details?.id,
      item?.variant_details?.variant_id,
    ];

    for (const candidate of candidates) {
      if (candidate !== null && candidate !== undefined && candidate !== '') {
        return candidate;
      }
    }

    return null;
  }

  getCartItemUnitPrice(item: any): number {
    const candidates = [
      item?.variant_details?.price,
      item?.variant?.price,
      item?.product?.price_data?.salePrice,
      item?.product?.price_data?.finalPrice,
      item?.product?.price_data?.regularPrice,
      item?.price,
    ];

    for (const candidate of candidates) {
      const parsed = this.toNumber(candidate);
      if (parsed !== null) {
        return parsed;
      }
    }

    return 0;
  }

  getCartItemVariantAttributes(item: any): Array<{ name: string; value: string }> {
    const variantDetails = item?.variant_details || item?.variant || {};
    const rawAttributes = Array.isArray(variantDetails?.attributes)
      ? variantDetails.attributes
      : Array.isArray(variantDetails?.attributes_detail)
        ? variantDetails.attributes_detail
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

  carList() {
    this.dataService.get('cart').pipe(
      catchError((error) => {
        return of(null); // or you can return a default value if needed
      })
    ).subscribe((response: any) => {
      this.isLoading = true;
      //console.log('response==>', response);
      if (response.success == true) {
        this.cartListData = response.data.data;
        if (this.cartListData.length <= 0) {
          localStorage.removeItem('appliedCoupon');
          this.cd.detectChanges();
        }


        this.calculateGstPrice(response.data.data);
        for (let i = 0; i < this.cartListData.length; i++) {
          const element = this.cartListData[i];
          const unitPrice = this.getCartItemUnitPrice(element);
          this.globalService.calculatePrice(element.quantity, i, unitPrice, this.cartListData);

        }
        this.calculateSubTotal();
        this.grandTotal = this.globalService.calculateGrandTotal(this.cartListData);
        this.cd.detectChanges();
      }

    })
  }

  calculateGstPrice(dataObj: any) {
    let data = dataObj;
    let payload: any = {
      items: []
    };
    console.log('data=====>', data);
    console.log('isCouponValue===>', this.appliedCoupon);

    payload.coupon_code = this.appliedCoupon;
    for (let i = 0; i < data.length; i++) {
      const element = data[i];
      const itemPayload: any = {
        quantity: element?.quantity,
        product_id: element?.product.id,
        salePrice: this.getCartItemUnitPrice(element),
        gstPercent: element?.product?.price_data?.caclulatedObj?.gstPercent
      };
      const variantId = this.getCartItemVariantId(element);
      if (variantId !== null && variantId !== undefined && variantId !== '') {
        itemPayload.variant_id = variantId;
      }
      payload.items.push(itemPayload);
    }
    this.dataService.postCommonApi(payload, 'calculate-prices')
      .pipe(
        catchError((err) => {
          console.error('Error:', err);
          setTimeout(() => {
            this.globalService.showToast(err);
          }, 100);
          return of(err);
        })
      )
      .subscribe((res: any) => {
        console.log('payload===>', res.data.summary);
        this.gstSummary = res.data.summary;
        this.gstSummary.items = res.data.items;
        this.isLoading = false;
        console.log('this.cartListData==>', this.gstSummary);
        this.cd.detectChanges();
      })

  }
  calculateSubTotal() {
    // this.grandTotal = 0;
    this.subTotal = 0;
    for (let i = 0; i < this.cartListData.length; i++) {
      const element = this.cartListData[i];
      this.subTotal += element.product.price_data.finalPrice;
    }
    this.calculateGrandTotal();
    // //console.log('this.grandTotal==>',this.grandTotal);
  }
  calculateGrandTotal() {
    let shippingCharge = 0;
    this.grandTotal = shippingCharge + this.subTotal;
  }
  openCheckout(addressId: any) {
    //   if (this.checkoutForm.invalid) {
    //   this.checkoutForm.markAllAsTouched();
    //   return;
    // }
    // else{openCheckout
    console.log('this.selectedPaymentMethod==>', this.selectedPaymentMethod);

    if (this.selectedPaymentMethod == 'cod') {

      this.orderSubmit(addressId, this.selectedPaymentMethod);
    }
    else {
      let checkoutPaymentData = {
        amount: this.grandTotal,
        name: this.checkoutForm.value.fname + ' ' + this.checkoutForm.value.lname,
        email: this.checkoutForm.value.email,
        phone: this.checkoutForm.value.phone
      }
      // this.orderSubmit(addressId);
      this.orderSubmit(addressId, this.selectedPaymentMethod, '', checkoutPaymentData);


    }
    // }
  }

  orderSubmit(addressId: any, paymentMethod: any, paymentResponse: any = '', checkoutPaymentData: any = false) {


    const missingVariantItem = this.cartListData.find(
      (cartItem: any) => this.isVariableProductItem(cartItem) && !this.getCartItemVariantId(cartItem)
    );

    if (missingVariantItem) {
      this.globalService.showToast({
        success: false,
        message: 'Please re-select variant options for all variable products before placing the order.',
      });
      return;
    }

    const payload = this.cartListData.map((cartItem: any) => {
      const itemPayload: any = {
        product_id: cartItem.product.id,
        quantity: cartItem.quantity,
        price: this.getCartItemUnitPrice(cartItem),
      };

      const variantId = this.getCartItemVariantId(cartItem);
      if (variantId !== null && variantId !== undefined && variantId !== '') {
        itemPayload.variant_id = variantId;
      }

      return itemPayload;
    });

    let OrderSubmitPayload = {
      items: payload.map((item: any, index: any) => ({
        ...item,
        tax_details: this.gstSummary.items[index] || null
      })),
      total_amount: this.grandTotal,
      address_id: addressId,
      payment_method: this.selectedPaymentMethod,
      shipping_address: addressId
    };
    this.dataService.post(OrderSubmitPayload, 'orders')
      .pipe(
        catchError(err => {
          console.error('Error:', err);
          return of(err);
        })
      )
      .subscribe((res: any) => {
        if (res.success == true) {
          console.log('Response:', res);
          // this.globalService.showToast(res);
          this.appliedCoupon = '';
          localStorage.removeItem('appliedCoupon');
          if (paymentMethod != 'cod') {
            // this.paymentUpdate(res, paymentResponse);
          }
          if (checkoutPaymentData) {


            this.razorpayService.openCheckout(res.data.data.id, checkoutPaymentData)
              .subscribe({
                next: (response: any) => {
                  if (response) {

                    this.dataService.post(response, 'payments/verify')
                      .pipe(
                        catchError(err => {
                          console.error('Error:', err);
                          return of(err);
                        })
                      )
                      .subscribe((res: any) => {
                        if (res.success == true) {


                        }
                      })




                    this.router.navigate(['/thank-you'], {
                      queryParams: {
                        orderId: res.data.data.id  // res.orderId   // 👈 pass your order id here
                      }
                    })
                    this.globalFunctionService.getCount();
                    this.cd.detectChanges();
                  }
                },
                error: (error: any) => {
                  if (error.error) {
                    console.error("Payment Failed:", error);
                  }
                }
              });

          } else {
            this.globalFunctionService.getCount();
            this.cd.detectChanges();
            this.router.navigate(['/thank-you'], {
              queryParams: {
                orderId: res.data.data.id   // 👈 pass your order id here
              }
            })
          }

          // this.razorpayService.openCheckout(this.grandTotal);
          // this.router.navigate(['/cart']);

        }
        else {
          if (res.err) {
            this.globalService.showToast(res.err);
          }
        }
      });





    //           {
    //     "items": [],
    //     "items.product_id": [],
    //     "items.quantity": [],
    //     "total_amount": 10,
    //     "address_id": "address_id sample value",
    //     "payment_method": "payment_method sample value",
    //     "shipping_address": "shipping_address sample value"
    // }

  }

  paymentUpdate(orderResponse: any, paymentUpdate: any) {
    const paymentId = 4; // dynamic value
    const endpoint = `orders/${paymentId}/payment/update`;

    let payload: any = {
      payment_status: 'success',
      payment_details: {
        payment_id: paymentUpdate.razorpay_payment_id,
        //     "transaction_id": "TXN_23984723987",
        payment_gateway: "razorpay",
        amount: orderResponse.data.data.total_amount,
        currency: "INR",
        method: "card",
        //  card_last4: "4242"
        //   }
      }
    }
    //           {
    //   "payment_status": "success",
    //   "payment_details": {
    //     "payment_id": "PAY_9823749823",
    //     "transaction_id": "TXN_23984723987",
    //     "payment_gateway": "razorpay",
    //     "amount": 1200,
    //     "currency": "INR",
    //     "method": "card",
    //     "card_last4": "4242"
    //   }
    // }
    this.dataService.post(payload, endpoint)
      .pipe(
        catchError(err => {
          console.error('Error:', err);
          return of(err);
        })
      )
      .subscribe((res: any) => {
        if (res.success == true) {
          //console.log('Response: FINAL OUTPUT', res);
        }
        else {
          if (res.err) {
            this.globalService.showToast(res.err);
          }
        }
      });

  }
  placeOrder() {
    // if (this.selectedPaymentMethod == false) {
    // this.isSelectPaymentMethodInput = false;
    //console.log('this.addressListData==>',this.addressListData);

    if (!this.addressListData || this.addressListData == undefined) {
      this.addressNotfound = true;
      return;
    }
    //  if (this.checkoutForm.invalid) {
    //   this.checkoutForm.markAllAsTouched();
    // }
    // return;
    // }

    this.openCheckout(this.addressListData.id);

    //  if (this.checkoutForm.invalid) {
    //   this.checkoutForm.markAllAsTouched();
    //   return;
    // }
    //       else if (this.checkoutForm.valid) {
    //       //console.log(this.checkoutForm.value);
    //       this.fullAddrress = this.checkoutForm.value;
    //        this.fullAddrress.label = this.checkoutForm.value.type;
    //        this.fullAddrress.name = this.checkoutForm.value.fname + ' ' + this.checkoutForm.value.lname;
    //        this.dataService.post(this.fullAddrress, 'addresses')
    //             .pipe(
    //               catchError(err => {
    //                 console.error('Error:', err);
    //                 return of(err);
    //               })
    //             )
    //             .subscribe((res: any) => {
    //               //console.log('Response:', res);
    //               if (res.success == true) { 

    //                 this.openCheckout(res.data.id);
    //               // this.razorpayService.openCheckout(this.grandTotal);
    //                 // this.router.navigate(['/cart']);
    //               }
    //               else {
    //                 if (res.err) {
    //                   this.globalService.showToast(res.err);
    //                 }
    //               }
    //             });
    //  }
  }
  createCheckoutBillingForm() {
    this.checkoutForm = this.fb.group({
      fname: ['', [Validators.required, Validators.minLength(2)]],
      lname: ['', [Validators.required, Validators.minLength(2)]],
      email: [this.email, [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^[0-9+\-\s]*$/)]],
      country: [98, Validators.required],
      state: ['', Validators.required],
      city: ['', Validators.required],
      postal_code: ['', [Validators.required]],
      type: ['', Validators.required],
      street: ['', Validators.required],
      location: [''],
      account: [false],
      remember: [false],
    });


    //      this.addressForm = this.fb.group({
    //      fname: ['', [Validators.required, Validators.minLength(2)]],
    //      lname: ['', [Validators.required, Validators.minLength(2)]],
    //      phone: [ '',[Validators.required,Validators.pattern(/^[0-9]{10}$/)]],
    //      street: ['', Validators.required],
    //      city: ['', Validators.required],
    //      state: ['', Validators.required],
    //      country: ['', Validators.required],

    //   postal_code: [
    //     '',
    //     [
    //       Validators.required,
    //       Validators.pattern(/^[0-9]{4,10}$/)   // adjust for your country
    //     ]
    //   ],

    //   // country: ['', Validators.required],

    //   type: ['', Validators.required]
    // })

  }
  hasError(field: string, error: string) {
    return (
      this.checkoutForm.get(field)?.hasError(error) &&
      (this.checkoutForm.get(field)?.dirty ||
        this.checkoutForm.get(field)?.touched)
    );
  }


  loadCountries() {

    this.globalFunctionService.getCountries().subscribe((res: any) => {
      this.countries = res.data;
      //console.log('res====>', this.countries);
      this.states = this.countries[98].states;
    })
    // this.getCountries().subscribe({
    //   next: (data) => {
    //     this.countries = data
    //   },
    //   error: () => console.error("Failed to load countries");
    //   this.cd.detectChanges();
    // });

  }

  onStateChange(event: Event) {
    const value = (event.target as HTMLSelectElement).value;
    //console.log('Selected index:', value);
    this.globalFunctionService.getCities("India", value)
      .subscribe(cities => {
        this.cities = cities;
      });
  }

  onCountryChange(event: Event) {
    const index = Number((event.target as HTMLSelectElement).value);
    //console.log('Selected index:', index);
    this.states = this.countries[index].states;
    //console.log('this.cities===>', this.states);

    // Example: load cities dynamically
    // this.loadCities(selectedCountry);
  }
  setAddressType(type: string) {
    this.checkoutForm.patchValue({ type: type });
  }
  // common public api 

  //  getCountries() {
  //   return this.http.get<any>(
  //     'https://countriesnow.space/api/v0.1/countries/states'
  //   ).pipe(
  //     map((res) => res)
  //   );
  // }
  // getCities(country: string, state: string) {
  //   return this.http.post<any>(
  //      'https://countriesnow.space/api/v0.1/countries/state/cities',
  //     // `https://countriesnow.space/api/v0.1/countries/${state}/${country}/cities`,
  //     { country, state }
  //   ).pipe(
  //     map(res => res.data)
  //   );
  // }
  choosePaymentMethod(method: any) {
    this.selectedPaymentMethod = method;
    //console.log('menthodi==.', method);

  }

  getAddressList() {
    this.dataService.get('addresses').pipe(
      catchError((error) => {
        return of(null); // or you can return a default value if needed
      })
    ).subscribe((response: any) => {
      //console.log('response==>', response);
      if (response.success == true) {
        this.AllAddressList = response.data;
        this.addressListData = response.data.find(
          (item: any) => item.is_default === 1
        );
        //console.log('addressListData===>', this.addressListData);

        this.cd.detectChanges();
      }

    })
  }
  async editAddress(address: any) {
    let addresss = address;
    this.globalFunctionService.openAddressPopup(addresss).then((res: any) => {
      if (res.result === 'success') {
        this.cd.detectChanges();
        this.addressNotfound = false;
      }
      this.getAddressList();
      //console.log('addressResp==========>',res);
    })

    this.cd.detectChanges();
  }
  async addAddress() {
    let addresss = {
      isNewAddress: true
    };
    this.globalFunctionService.openAddressPopup(addresss).then((res: any) => {
      if (res.result === 'success') {
        this.cd.detectChanges();
        this.addressNotfound = false;
      }
      this.getAddressList();
      //console.log('addressResp==========>',res);
    })

    this.cd.detectChanges();

  }
  getSelectedAddress(item: any) {
    //console.log('item===>', item);
    this.changedSelectedAddress = item;

  }
  savedFinalAddress() {
    this.addressListData = this.changedSelectedAddress;
    this.addressNotfound = false;

    if (this.changedModalRef) {
      this.changedModalRef.close();
    }
    this.cd.detectChanges();
  }

  openChangedModal() {
    this.changedModalRef = this.ngbModal.open(this.changedModal, {
      windowClass: 'mobile-modal',
      centered: true,
    });
  }

  closeModal() {
    if (this.changedModalRef) {
      this.changedModalRef.close();
    }
  }

  openCouponModal() {
    this.couponModalRef = this.ngbModal.open(this.couponModal, {
      windowClass: 'mobile-modal',
      centered: true,
    });
  }

  checkCoupon(couponValue: any) {
    const ids = this.cartListData.map((item: any) => {
      return item.id
    });
    this.appliedCoupon = couponValue;
    let payload: any = {
      coupon_code: couponValue,
      cart_ids: ids,
    }
    let isGuest = JSON.parse(localStorage.getItem('GUEST_TOKEN') || 'null');
    if (isGuest != null) {
      payload.guest_token = isGuest
    }
    this.dataService.post(payload, 'orders/apply-coupon')
      .pipe(
        catchError(err => {
          console.error('Error:', err);
          return of(err);
        })
      )
      .subscribe((res: any) => {
        if (res.success == true) {
          this.globalService.showToast(res);
          if (this.couponModalRef) {
            this.couponModalRef.close();
          }
          localStorage.setItem('appliedCoupon', this.appliedCoupon);
          this.calculateGstPrice(this.cartListData);
        }
        else if (res && res.error && res.error.message) {
          this.globalService.showToast(res.error);
        }
      })
  }
  deleteCartItem(id: any) {
    if (id) {
      this.cartItemId = id;
      this.modalRef = this.ngbModal.open(this.deleteCart, {
        windowClass: 'mobile-modal',
        centered: true,
      });
    }
  }

  deleteItem() {
    if (this.cartItemId) {
      this.dataService
        .delete(`cart/${this.cartItemId}`)
        .pipe(
          catchError((err) => {
            console.error('Error:', err);
            return of(err);
          })
        )
        .subscribe((res: any) => {
          if (res.success == true) {
            this.globalService.showToast(res);
            if (this.modalRef) {
              this.modalRef.close();
            }
            this.carList();
            this.globalFunctionService.getCount();
            this.cd.detectChanges();
          } else if (res.error && res.error.message) {
            this.globalService.showToast(res.error);
          }
        });
    }
  }
  increase(quantity: any, index: any) {
    this.cartListData[index].quantity++;
    let id = this.cartListData[index].id;
    let productQuantity = this.cartListData[index].quantity;
    this.globalService.calculatePrice(
      productQuantity,
      index,
      this.getCartItemUnitPrice(this.cartListData[index]),
      this.cartListData
    );
    this.updateCartList(productQuantity, id);
  }
  decrease(quantity: any, index: any) {
    if (quantity > 1) {
      this.cartListData[index].quantity--;
      let id = this.cartListData[index].id;
      let productQuantity = this.cartListData[index].quantity;
      this.globalService.calculatePrice(
        productQuantity,
        index,
        this.getCartItemUnitPrice(this.cartListData[index]),
        this.cartListData
      );
      this.updateCartList(productQuantity, id);
    }
  }
  updateCartList(quantity: any, id: any) {
    let data = {
      quantity: quantity,
    };
    this.dataService
      .patch(`cart/${id}`, data)
      .pipe(
        catchError((err) => {
          console.error('Error:', err);
          setTimeout(() => {
            this.globalService.showToast(err);
          }, 100);
          return of(err);
        })
      )
      .subscribe((res: any) => {
        // //console.log('Response:', res);
        if (res.success) {
          this.calculateGstPrice(this.cartListData);
          this.grandTotal = this.globalService.calculateGrandTotal(this.cartListData);
        } else if (res && res.error && res.error.message) {
          //console.log('error  :', res.error.message);
          this.globalService.showToast(res.error);
        }
        this.cd.detectChanges();
        // this.categoryListData = res.data;
      });
  }
  removeCoupon() {
    this.appliedCoupon = '';
    this.cd.detectChanges();
    localStorage.removeItem('appliedCoupon');
    // this.router.navigate(
    //   [],
    //   {
    //     queryParams: { coupon: null },
    //     queryParamsHandling: 'merge'
    //   }
    // );
    this.calculateGstPrice(this.cartListData);
  }
  addItemAlert() {
    this.globalService.showToast({ message: 'Your Cart Is Emply!' });
  }
}
