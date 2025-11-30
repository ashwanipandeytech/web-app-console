import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, inject, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { catchError, of } from 'rxjs';
import { DataService } from 'shared-lib';
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
  // selectedAddress: string = '';
   searchText = '';
  suggestions: any[] = [];
  selectedAddress = '';
  isNewAddress: Boolean=false;
  addressForm!: FormGroup;
  lat: any;
  lng: any;
constructor(private http: HttpClient,private fb: FormBuilder){
  this.addAddressForm();
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
      fullAddrress.location = [{
        lat:this.lat,lng:this.lng
      }],
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
  // address payload
// 'type' => 'home',
//             'label' => 'Home',
//             'name' => 'John Doe',
//             'phone' => '1234567890',
//             'street' => '123 Test St',
//             'city' => 'Test City',
//             'state' => 'Test State',
//             'postal_code' => '12345',
//             'country' => 'IN',
//             'location' => ['lat' => 12.34, 'lng' => 56.78],
}
