import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component, ElementRef, inject, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { catchError, of } from 'rxjs';
import { DataService } from 'shared-lib';
import {AddAddressModal} from 'shared-lib/model/add-address-modal/add-address-modal';
import { MatDialog } from '@angular/material/dialog';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import {DynamicPopup} from 'shared-lib/components/confirmationPopup/confirmationPopup.component'
declare const google: any;

@Component({
  selector: 'app-cart',
  imports: [ CommonModule,ReactiveFormsModule],
  templateUrl: './cart.html',
  styleUrl: './cart.scss'
})
export class Cart {
  @ViewChild('addressInput') addressInput!: ElementRef<HTMLInputElement>;
  private dataService:any = inject(DataService);
  readonly dialog = inject(MatDialog);
  readonly ngbModal = inject(NgbModal)

  // selectedAddress: string = '';
  searchText = '';
  suggestions: any[] = [];
  selectedAddress = '';
  isNewAddress: Boolean=false;
  addressForm!: FormGroup;
  lat: any;
  lng: any;
  addressListData: any=[];
  cartListData: any=[];
  grandTotal: number=0;
constructor(private http: HttpClient,private fb: FormBuilder,private cd:ChangeDetectorRef){
  this.addAddressForm();
  this.getAddressList();
  this.carList();
}
  newAddress() {
    this.isNewAddress=true;
  }
  back(){
    window.history.back();
  }
  //  ngAfterViewInit() {
  //     const autocomplete = new google.maps.places.Autocomplete(
  //       this.addressInput.nativeElement,
  //       {
  //         types: ['geocode'],
  //         componentRestrictions: { country: ['IN'] }
  //       }
  //     );

  //     autocomplete.addListener('place_changed', () => {
  //       const place = autocomplete.getPlace();
  //       this.selectedAddress = place.formatted_address;
  //     });
  //   }
  //   getCurrentLocation() {
  //     if (navigator.geolocation) {
  //       navigator.geolocation.getCurrentPosition((pos) => {
  //         const lat = pos.coords.latitude;
  //         const lng = pos.coords.longitude;
  // console.log('lat==>',lat);
  // console.log('lng==>',lng);

  //         const geocoder = new google.maps.Geocoder();
  //         geocoder.geocode({ location: { lat, lng } }, (res: any) => {
  //           if (res[0]) {
  //             this.selectedAddress = res[0].formatted_address;
  //             console.log('this.selectedAddres==>',this.selectedAddress);
              
  //           }
  //         });
  //       });
  //     }
  //   }


  searchAddress(event: any) {
    const query = event.target.value;
    if (query.length < 3) return;

    this.http.get(`https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&countrycodes=in&q=${query}`)
    .subscribe((res: any) => {
      this.suggestions = res;
    });
  }

  selectSuggestion(item: any) {
    this.selectedAddress = item.display_name;
    this.suggestions = [];
  }

  getCurrentLocation() {
    navigator.geolocation.getCurrentPosition((pos) => {
      this.lat = pos.coords.latitude;
      this.lng = pos.coords.longitude;
      this.http.get(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${this.lat}&lon=${this.lng}`)
      .subscribe((res: any) => {
        this.selectedAddress = res.display_name;
        console.log('this.selectedAddress===>',this.selectedAddress);
        
      });
    });
  }

  addAddressForm(){
    this.addressForm = this.fb.group({
      name: ['', Validators.required],
      phone: ['', [Validators.pattern(/^[0-9]{10}$/)]],
      landmark: [''],
      street: [''],
      city: [''],
      state: [''],
      postal_code: [''],
      country: [''],
      type:[''],
    });
  }

  setAddressType(type: string) {
    this.addressForm.patchValue({ type: type });
  }

  submitForm() {
    if (this.addressForm.valid) {
      console.log(this.addressForm.value);
      let fullAddrress = this.addressForm.value;
      if (this.lat && this.lng) {
        fullAddrress.location = [{
          lat:this.lat,lng:this.lng
        }]
      }
      else{
        fullAddrress.location = '';
      }
    
      fullAddrress.label = this.addressForm.value.type;
      this.dataService.callApiNew(fullAddrress, 'addresses')
      .pipe(
            catchError(err => {
              console.error('Error:', err);
              return of(null);
            })
      )
      .subscribe((res: any) => {
        console.log('Response:', res);
        if (res.success == true) {   
          // this.router.navigate(['/cart']);
        }
      });
      console.log('addresss=====>',fullAddrress);
    } else {
      this.addressForm.markAllAsTouched();
    }
  }

  onSelectAddress(item: any) {
    console.log("Selected:", item);
  }

  getAddressList(){
    this.dataService.callGetApi('addresses').pipe(
    catchError((error) => {
      return of(null); // or you can return a default value if needed
      })
    ).subscribe((response: any) => {
      console.log('response==>',response);
      if (response.success == true) {
        this.addressListData = response.data;
        this.cd.detectChanges();
      }

    })
  }

  openAddressPopup(){
    const modalRef: NgbModalRef = this.ngbModal.open(AddAddressModal,{windowClass:'mobile-modal'});
    modalRef.result.then((result) => {
      console.log('Modal closed with result:', result);
    }).catch((reason) => {
      console.log('Modal dismissed:', reason);
    });
  }

  carList(){
     this.dataService.callGetApi('cart').pipe(
      catchError((error) => {
        return of(null); // or you can return a default value if needed
      })
    ).subscribe((response: any) => {
console.log('response==>',response);
if (response.success == true) {
  this.cartListData = response.data.data;
  for (let i = 0; i < this.cartListData.length; i++) {
    const element = this.cartListData[i];
    // if (element.) {
      
    // }
    element.product.price_data['finalPrice'] = element?.product.price_data?.regularPrice;
      this.calculatePrice(element.quantity,i,element.product.price_data.regularPrice);

  }
  this.calculateGrandTotal();
  this.cd.detectChanges();
}

    })
  }
  increase(quantity:any,index:any) {
    this.cartListData[index].quantity++;
    let productQuantity = this.cartListData[index].quantity;
    this.calculatePrice(productQuantity,index,this.cartListData[index].product.price_data.regularPrice);
  }

  decrease(quantity:any,index:any) {
    if (quantity > 1) {
      this.cartListData[index].quantity--;
      let productQuantity = this.cartListData[index].quantity;
      this.calculatePrice(productQuantity,index,this.cartListData[index].product.price_data.regularPrice);
    }
  }
     calculatePrice(quantity:any,index:any,price:any){
      let productQuantity:any = null;
      let regularPrice = null;
      productQuantity = quantity;
      regularPrice = price;
      this.cartListData[index].product.price_data.finalPrice = quantity * regularPrice;
      this.calculateGrandTotal();
    // this.selectedProduct.price_data.regularPrice = this.productPrice * this.quantity;
    this.cd.detectChanges();
      }
      calculateGrandTotal(){
        // this.grandTotal = 0;
      this.grandTotal = 0;

      for (let i = 0; i < this.cartListData.length; i++) {
        const element = this.cartListData[i];
        this.grandTotal += element.product.price_data.finalPrice;
      }
        // console.log('this.grandTotal==>',this.grandTotal);
      }

      // deleteItem(id:any){


         deleteItem(id: any): void {
    let popupData = {
      title: 'Cart Item',
      description: 'Are you sure, you want to delete Item',
      id: id
    }
    let dialogRef = this.dialog.open(DynamicPopup, {
      width: '250px',
      data: popupData,
    });
    dialogRef.afterClosed().subscribe(result => {
      console.log('Dialog closed with:', result);

      if (result.action === 'ok') {
        this.deleteCartItem(id);

      }
    })
  // }
      }

       deleteCartItem(id: any) {
    this.dataService.callDeleteApi('cart', id)
      .pipe(
        catchError(err => {
          console.error('Error:', err);
           setTimeout(() => {
          // this.globalService.showMsgSnackBar(err);
        }, 100);
          return of(null);
        })
      )
      .subscribe((res: any) => {
        console.log('Response:', res);
        if (res.success == true) {
          // this.calculateGrandTotal();
          this.carList();
          this.cd.detectChanges();
        }
        // this.getCategoryList();
        // this.categoryListData = res.data;
      });
  }
  // address payload
  // 'type' => 'home',
  // 'label' => 'Home',
  // 'name' => 'John Doe',
  // 'phone' => '1234567890',
  // 'street' => '123 Test St',
  // 'city' => 'Test City',
  // 'state' => 'Test State',
  // 'postal_code' => '12345',
  // 'country' => 'IN',
  // 'location' => ['lat' => 12.34, 'lng' => 56.78],
}
