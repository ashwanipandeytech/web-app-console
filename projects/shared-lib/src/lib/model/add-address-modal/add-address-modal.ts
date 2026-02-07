import { ChangeDetectorRef, Component, ElementRef, inject, Input, ViewChild } from '@angular/core';

import { HttpClient } from '@angular/common/http';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { catchError, Observable, of } from 'rxjs';
import { DataService } from '../../services/data-service';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { environment } from '../../../../../../environments/environment';
import { CheckPlatformService } from '../../services/check-platform.service';
import { GlobaCommonlService } from '../../services/global-common.service';
import { SignalService } from '../../services/signal-service';
declare const google: any;

@Component({
  selector: 'lib-add-address-modal',
  imports: [ReactiveFormsModule],
  templateUrl: './add-address-modal.html',
  styleUrl: './add-address-modal.scss'
})
export class AddAddressModal {
  @ViewChild('addressInput') addressInput!: ElementRef<HTMLInputElement>;
  private dataService:any = inject(DataService);
  private checkPlatform:any = inject(CheckPlatformService);
  private globalService = inject(GlobaCommonlService);
  private signalService = inject(SignalService);
private apiUrl = 'https://raw.githubusercontent.com/sab99r/Indian-States-And-Districts/master/states-and-districts.json';
  // selectedAddress: string = '';
  searchText = '';
  suggestions: any[] = [];
  selectedAddress = '';
  isNewAddress: Boolean=true;
  addressForm!: FormGroup;
  lat: any;
  lng: any;
  addressListData: any=[];
  searchQuery: any;
  browser: boolean=true;
  @Input () data:any;
  @Input () isfrom:any;
  isLogin: boolean=false;
  isNewAddressCartPage: any;
  states: any;
  constructor(private http: HttpClient,private fb: FormBuilder,private cd:ChangeDetectorRef,private activeModal:NgbActiveModal){
    this.addAddressForm();
    // this.getAddressList();
    
   
    let platformName = this.checkPlatform.checkPlatformType();
    //console.log('platformName==>',platformName);
    // if (platformName.Web == true) {
    //   this.browser = true;
    //   this.isNewAddress = true;
    // }
    // else{
    //   this.browser = false;
    // }
  }

  newAddress() {
    this.isNewAddress=true;
  }
  searchAddress(event: any) {
 const apiKey = environment?.ADDRESS_API_KEY;
  const query = event.target.value;

  // if (!query) return;
// not included state api 
  // const url = `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(query)}&filter=countrycode:in&apiKey=${apiKey}`;
//  filter by state up 
  const url = `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(query)}&filter=rect:77.09,23.82,84.67,30.41&apiKey=${apiKey}`;
  
  
// }, 100);
  
  this.searchQuery = event.target.value;
  this.searchText = this.searchQuery;
if (this.searchQuery == '') {
  this.suggestions = [];
}
    // if (query.length < 3) return;

     this.http.get(url)
    .subscribe((res: any) => {
      //console.log('res===>',res);
      this.suggestions = res.features;
      //console.log('this.suggestions==>',this.suggestions);
      this.cd.detectChanges();
      // properties.formatted
    });
// setTimeout(() => {
  // this.http.get(`https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&countrycodes=in&q=${this.searchQuery}`)
  //   .subscribe((res: any) => {
  //     this.suggestions = res;
  //   });
// }, 100);
  }

  ngOnInit(){
     this.isNewAddressCartPage=this.data?.isNewAddress

    let user = JSON.parse(localStorage.getItem('user') || '{}');
    //console.log('user==>',user);

    if ( typeof user === 'object' && Object.keys(user).length <= 0) {
      this.isLogin = false;
    }
    else{
      this.isLogin = true;

    }
    if (this.data) {
      this.addressForm.patchValue({
      name:this.data.name,
      phone:this.data.phone,
    street: this.data.street,
    type:this.data.type,
    city: this.data.city || this.data.town || '',
    state: this.data.state || '',
    postal_code: this.data.postcode || this.data.postal_code || '',
    country: this.data.country || 'IN',
    // location:[{ lat:item.properties.lat,lng:item.properties.lon}]
  });
    }
     this.getStates().subscribe(res => {
      this.states = res.states;
      console.log('states==>',this.states);
      this.cd.detectChanges();
    });
  }
  selectSuggestion(item: any) {
    // //console.log('searchText==>',item);
      this.searchText = '';
  this.suggestions = [];
    this.selectedAddress = item.properties.formatted;
    this.suggestions = [];
    this.searchQuery ='';
    //console.log('    this.searchText==>',this.searchText);
    // patch values into form values 
          this.signalService.currentLocation.set(this.selectedAddress);
          localStorage.setItem('currentLocation',JSON.stringify(this.selectedAddress))
          if (!this.isLogin) {
            this.closePopup('success');
          }
     this.addressForm.patchValue({
    street: item.properties.county || item.properties.address_line1 || '',
    city: item.properties.city || item.properties.town || '',
    state: item.properties.state || '',
    postal_code: item.properties.postcode || item.properties.postal_code || '',
    country: item.properties.country || '',
    // location:[{ lat:item.properties.lat,lng:item.properties.lon}]
  });
    this.cd.detectChanges();
  }

  getCurrentLocation() {
    navigator.geolocation.getCurrentPosition((pos) => {
      this.lat = pos.coords.latitude;
       this.lng = pos.coords.longitude;

      this.http.get(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${this.lat}&lon=${this.lng}`)
        .subscribe((res: any) => {
          //console.log('res==>',res);
         this.addressForm.patchValue({
          state: res.address.state,
          country: res.address.country,
          postal_code: res.address.postcode,
          street: res.address.state_district,
});


          this.selectedAddress = res.display_name;
          //console.log('this.selectedAddress===>',this.selectedAddress);
          this.signalService.currentLocation.set(this.selectedAddress);
          localStorage.setItem('currentLocation',JSON.stringify(this.selectedAddress))
          this.isNewAddress = true;
          this.cd.detectChanges();
          if (!this.isLogin) {
            this.activeModal.close();
          }
        });
    });
  }

  addAddressForm(){
    this.addressForm = this.fb.group({
  name: ['', [Validators.required, Validators.minLength(2)]],

  phone: [
    '+91-',
    [
      Validators.required,
      Validators.pattern(/^[0-9]{10}$/)  // 10 digit phone number
    ]
  ],

  street: ['', Validators.required],
  city: ['', Validators.required],

  state: ['', Validators.required],

  postal_code: [
    '',
    [
      Validators.required,
      Validators.pattern(/^[0-9]{6,6}$/)   // adjust for your country
    ]
  ],

  country: ['IN', Validators.required],

  type: ['', Validators.required]
});

  }
 setAddressType(type: string) {
    this.addressForm.patchValue({ type: type });
  }

  submitForm() {
    if (this.addressForm.valid) {
       let userData: any = JSON.parse(localStorage.getItem('user') || 'null');
    //  else {
    //   this.isLoggedIn = true;
    // }
      //console.log(this.addressForm.value);
      let fullAddrress = this.addressForm.value;
      if (this.lat && this.lng) {
          fullAddrress.location = {
        lat:this.lat,lng:this.lng
      }
      }
      else{
        fullAddrress.location = '';
      }
    
      fullAddrress.label = this.addressForm.value.type;
      fullAddrress.is_default=true;
//console.log('userData==>',userData);

if (userData == null) {
  localStorage.removeItem('tempAddress');
  localStorage.setItem('tempAddress',JSON.stringify(fullAddrress));
  this.closePopup('success');
  // this.globalService.showMsgSnackBar(res);
  // this.getAddressList();
  this.cd.detectChanges();
  return;
}
else{

  console.info('fullAddrress',fullAddrress)
  this.dataService.post(fullAddrress, 'addresses')
       .pipe(
         catchError(err => {
           console.error('Error:', err);
  
           return of(null);
         })
       )
       .subscribe((res: any) => {
         //console.log('Response:', res);
         if (res.success == true) {   
           this.closePopup('success');
           this.globalService.showMsgSnackBar(res);
          //  this.getAddressList();
           this.cd.detectChanges();
  
           // this.router.navigate(['/cart']);
         }
       });
}

      // if (userData?.token == undefined || userData == null) {
      //  return;
      //     }

      //console.log('addresss=====>',fullAddrress);
      
    } else {
      this.addressForm.markAllAsTouched();
    }
  }






   updateAddress() {
    if (this.addressForm.valid) {
      //console.log(this.addressForm.value);
      let fullAddrress = this.addressForm.value;
      if (this.lat && this.lng) {
          fullAddrress.location = {
        lat:this.lat,lng:this.lng
      }
      }
      else{
        fullAddrress.location = '';
      }
      fullAddrress.id = this.data.id;
      fullAddrress.label = this.addressForm.value.type;

      fullAddrress.phone = fullAddrress.phone.toString()
      fullAddrress.postal_code = fullAddrress.postal_code.toString()
    
       this.dataService.put(fullAddrress,  `addresses/${this.data.id}`,)
            .pipe(
              catchError(err => {
                console.error('Error:', err);
      
                return of(null);
              })
            )
            .subscribe((res: any) => {
              //console.log('Response:', res);
              if (res.success == true) {   
                this.closePopup('success');
                this.globalService.showMsgSnackBar(res);
                // this.getAddressList();
                this.cd.detectChanges();
                // this.router.navigate(['/cart']);
              }
            });
      //console.log('addresss=====>',fullAddrress);
      
    } else {
      this.addressForm.markAllAsTouched();
    }
  }
onSelectAddress(item: any) {
  //console.log("Selected:", item);
}
  getAddressList(){
       this.dataService.get('addresses').pipe(
      catchError((error) => {
        return of(null); // or you can return a default value if needed
      })
    ).subscribe((response: any) => {
//console.log('response==>',response);
if (response.success == true) {
  this.addressListData = response.data;
  this.cd.detectChanges();
}

    })
  }


  get name() { return this.addressForm.get('name'); }
get phone() { return this.addressForm.get('phone'); }
get street() { return this.addressForm.get('street'); }
get city() { return this.addressForm.get('city'); }
get state() { return this.addressForm.get('state'); }
get postal_code() { return this.addressForm.get('postal_code'); }
get country() { return this.addressForm.get('country'); }
get type() { return this.addressForm.get('type'); }

closePopup(action:any){
  this.activeModal.close({result:action});
}
 getStates(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }
}
