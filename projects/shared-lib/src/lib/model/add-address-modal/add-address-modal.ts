import { ChangeDetectorRef, Component, ElementRef, inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { catchError, of } from 'rxjs';
import { DataService } from '../../services/data-service';
declare const google: any;

@Component({
  selector: 'lib-add-address-modal',
  imports: [CommonModule,ReactiveFormsModule],
  templateUrl: './add-address-modal.html',
  styleUrl: './add-address-modal.scss'
})
export class AddAddressModal {
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
  addressListData: any=[];
  constructor(private http: HttpClient,private fb: FormBuilder,private cd:ChangeDetectorRef){
    this.addAddressForm();
    this.getAddressList();
  }

  newAddress() {
    this.isNewAddress=true;
  }
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

}
