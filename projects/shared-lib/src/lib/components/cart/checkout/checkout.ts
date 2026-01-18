import { ChangeDetectorRef, Component, effect, ElementRef, inject, Inject, PLATFORM_ID, ViewChild } from '@angular/core';
import { DataService } from '../../../services/data-service';
import { catchError, map, of } from 'rxjs';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RazorpayService } from '../../../services/payment-razor';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { GlobaCommonlService } from '../../../services/global-common.service';
import { Router, RouterLink } from '@angular/router';
import { GlobalFunctionService } from '../../../services/global-function.service';
import { SignalService } from '../../../services/signal-service';
declare const bootstrap: any;

@Component({
  selector: 'web-checkout',
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterLink],
  templateUrl: './checkout.html',
  styleUrl: './checkout.scss'
})
export class Checkout {
  @ViewChild('changedModal') changedModal!: ElementRef;
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
    appliedCoupon: any='';
  gstSummary: any={};
  isLoading: boolean=true;
  isBrowser: boolean;
  private platformId = inject(PLATFORM_ID);
  constructor() {
    this.isBrowser = isPlatformBrowser(this.platformId);
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

  carList() {
    this.dataService.get('cart').pipe(
      catchError((error) => {
        return of(null); // or you can return a default value if needed
      })
    ).subscribe((response: any) => {
      this.isLoading = true;
      //console.log('response==>', response);
      if (response.success == true) {
        this.cartListData = response.data;
        this.calculateGstPrice(response.data);
        for (let i = 0; i < this.cartListData.data.length; i++) {
          const element = this.cartListData.data[i];
          // if (element.) {
          this.globalService.calculatePrice(element.quantity, i, element.product.price_data.salePrice, this.cartListData.data);
          // }
          //  element.product.price_data['finalPrice'] = element?.product.price_data?.salePrice;
          //    this.calculatePrice(element.quantity,i,element.product.price_data.regularPrice);

        }
        this.calculateSubTotal();
        this.grandTotal = this.globalService.calculateGrandTotal(this.cartListData.data);
        this.cd.detectChanges();
      }

    })
  }

    calculateGstPrice(dataObj:any){
      let data = dataObj.data;
    let payload:any={
      items:[]
    };
    console.log('data=====>',data);
    payload.coupon_code = this.appliedCoupon;
    for (let i = 0; i < data.length; i++) {
      const element = data[i];
      payload.items.push({
        quantity : element?.quantity,
        product_id:element?.product.id,
        salePrice:element?.product?.price_data?.salePrice,
        gstPercent:element?.product?.price_data?.caclulatedObj?.gstPercent
      })   
    }
    this.dataService.postCommonApi(payload,'calculate-prices')
      .pipe(
        catchError((err) => {
          console.error('Error:', err);
          setTimeout(() => {
            this.globalService.showMsgSnackBar(err);
          }, 100);
          return of(err);
        })
      )
      .subscribe((res: any) => {
        console.log('payload===>',res.data.summary);
        this.gstSummary = res.data.summary;
        this.gstSummary.items = res.data.items;
        this.isLoading = false;
        console.log('this.cartListData==>',this.gstSummary);
        
        this.cd.detectChanges();
      })

  }
  calculateSubTotal() {
    // this.grandTotal = 0;
    this.subTotal = 0;
    for (let i = 0; i < this.cartListData.data.length; i++) {
      const element = this.cartListData.data[i];
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
    // else{
    //console.log('this.selectedPaymentMethod==>', this.selectedPaymentMethod);

    if (this.selectedPaymentMethod == 'cod') {
      this.router.navigate(['/thank-you'])

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
      this.razorpayService.openCheckout(checkoutPaymentData)
        .subscribe({
          next: (response: any) => {
            if (response.success) {
              //console.log("Payment Success:", response);
              this.orderSubmit(addressId, this.selectedPaymentMethod, response);
              this.router.navigate(['/thank-you'])
            }
          },
          error: (error: any) => {
            if (error.error) {
              console.error("Payment Failed:", error);
            }
          }
        });

    }
    // }
  }

  orderSubmit(addressId: any, paymentMethod: any, paymentResponse: any = '') {
    //       this.cartListData = this.cartListData.map((item: any) => {
    //         if (item?.product?.id) {
    //           item.product.product_id = item.product.id;
    //           delete item.product.id;
    //         }

    //         delete item.product.description;
    //         delete item.product.inventory;
    //         delete item.product.media;
    //         delete item.product.uploadedImages;
    //         delete item.product.offer;
    //         delete item.product.shipping_config;
    //         delete item.product.shipping_info;
    //   return item;
    // });
    //console.log('res ----////==>', paymentResponse);


    const payload = this.cartListData.data.map((cartItem: any,index:any) => (
      {
      product_id: cartItem.product.id,
      quantity: cartItem.quantity,
      price: cartItem.product.price_data.salePrice,
    }
    ));
    let OrderSubmitPayload = {
  items: payload.map((item:any, index:any) => ({
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
          //console.log('Response:', res);
          this.globalService.showMsgSnackBar(res);
          if (paymentMethod != 'cod') {
            this.paymentUpdate(res, paymentResponse);
          }
          // this.razorpayService.openCheckout(this.grandTotal);
          // this.router.navigate(['/cart']);
        }
        else {
          if (res.err) {
            this.globalService.showMsgSnackBar(res.err);
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
            this.globalService.showMsgSnackBar(res.err);
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
    //                   this.globalService.showMsgSnackBar(res.err);
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

    this.closeModal();
    this.cd.detectChanges();
  }
  closeModal() {
    if (this.isBrowser) {
      const modal = bootstrap.Modal.getInstance(
        this.changedModal.nativeElement
      );
      modal.hide();
    }
  }
  checkCoupon(couponValue:any){
     console.log('Input value:', couponValue);
     let payload ={
      coupon_code:couponValue
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
          console.log('enter , re',res);
          
        }
      })
  }
}
