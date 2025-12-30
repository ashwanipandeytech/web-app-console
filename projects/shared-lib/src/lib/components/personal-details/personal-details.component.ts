import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DataService } from '../../services/data-service';
import { catchError, of } from 'rxjs';
import { GlobalFunctionService } from '../../services/global-function.service';

@Component({
  selector: 'app-personal-details',
  templateUrl: './personal-details.component.html',
  imports:[ReactiveFormsModule],
  styleUrls: ['./personal-details.component.scss'],
   changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PersonalDetailsComponent implements OnInit {
  profileForm!: FormGroup;
  private fb = inject(FormBuilder);
  private dataService = inject(DataService);
  private cd = inject(ChangeDetectorRef);

  private globalFunctionService = inject(GlobalFunctionService);
  currentUser:any;
  profileListData: any=[];
  countries: any=[];
  states: any;
  cities: any=[];
  constructor() { }

  ngOnInit() {
    this.profileDetailsForm();

    this.currentUser = JSON.parse(localStorage.getItem('user') || 'null');
    console.log('currentUser===>',this.currentUser);
    
  }

  profileDetailsForm(){
    let userLoginData = JSON.parse(localStorage.getItem('user') || 'null');
// let firstName = userLoginData.user.firstName.split(' ');
// console.log('firstName==>',firstName);

     this.profileForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      country: ['India', Validators.required],
      address: ['', Validators.required],
      city: ['', Validators.required],
      postcode: ['', [Validators.required,Validators.pattern(/^[0-9]{4,10}$/)] ],
      logo: [null] // file input
    });
        this.getProfileList();
  }
get phone() { return this.profileForm.get('phone'); }
get postcode() { return this.profileForm.get('postcode'); }

   onFileChange(event: any) {
    const file = event.target.files[0];
    this.profileForm.patchValue({ logo: file });
  }

   submitForm() {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }
      if (this.profileForm.valid) {
          console.log(this.profileForm.value);
          let fullAddrress = this.profileForm.value;
          // fullAddrress.location = '';
          // fullAddrress.label = 'home';
          // fullAddrress.isDefault = 1;
          fullAddrress.name = fullAddrress.firstName + ' ' +fullAddrress.lastName;
          
          this.dataService.put(fullAddrress, 'profile')
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
              }
    console.log("Form Value ===>", this.profileForm.value);
  }

getProfileList() {
  this.dataService.get('profile').pipe(
    catchError((error) => {
      console.error('Profile API error:', error);
      return of(null); // ✅ always return an observable
    })
  ).subscribe((response: any) => {

    if (!response || response.success !== true) {
      return;
    }

    this.profileListData = response.data?.data;
    if (!this.profileListData) {
      return;
    }

    console.log('profileListData ==>', this.profileListData);

    // ✅ Safe address access
    const data = this.profileListData.addresses?.[0] ?? {};

    // ✅ Safe name split
    const fullName = this.profileListData.name?.trim().split(' ') ?? [];
    const first = fullName[0] ?? '';
    const last = fullName.slice(1).join(' ') ?? '';
    const  email = this.profileListData.email;
    const  phone = this.profileListData.phone;

    this.loadCountries();
if (this.profileListData && response.success) {
  // ✅ patchValue is safe even if fields are empty
  this.profileForm.patchValue({
    firstName: first,
    lastName: last,
    email: email,
    phone: phone,
    country: data.country ?? '',
    address: data.street ?? '',
    city: data.city ?? '',
    postcode: data.postal_code ?? ''
  });

  this.cd.detectChanges();
}
  });
}


  loadCountries() {
    this.globalFunctionService.getCountries().subscribe((res:any)=>{
    this.countries = res.data;
    console.log('res====>',this.countries);
    this.getCities();
    this.cd.detectChanges();

    // this.states = this.countries[98].states;
  })
}
getCities(){
   this.globalFunctionService.getCities("India", 'Uttar Pradesh')
    .subscribe(cities => {
      this.cities = cities;
      this.cd.detectChanges();
    });
}
}
