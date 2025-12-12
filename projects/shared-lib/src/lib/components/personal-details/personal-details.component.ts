import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
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
  private globalFunctionService = inject(GlobalFunctionService);
  currentUser:any;
  addressListData: any=[];
  countries: any=[];
  states: any;
  cities: any=[];
  constructor() { }

  ngOnInit() {
    this.profileDetailsForm();
    this.getAddressList();

    this.currentUser = JSON.parse(localStorage.getItem('user') || 'null');
  }

  profileDetailsForm(){
     this.profileForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      country: ['India', Validators.required],
      address: ['', Validators.required],
      city: ['', Validators.required],
      postcode: ['', Validators.required],
      logo: [null] // file input
    });
  }

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
          fullAddrress.location = '';
          fullAddrress.label = 'home';
          fullAddrress.isDefault = 1;
          
          this.dataService.post(fullAddrress, 'addresses')
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

  getAddressList(){
       this.dataService.get('addresses').pipe(
      catchError((error) => {
        return of(null);
      })
    ).subscribe((response: any) => {
      if (response.success == true) {
        this.addressListData = response.data;
        console.log('addressListData==>',this.addressListData);
        if (this.addressListData.length>0) {
       const data = response.data[0];

        const fullName = data.name?.trim().split(' ') || [];
        const first = fullName[0] || '';
        const last = fullName.slice(1).join(' ') || '';
console.log('this.userres==>',this.currentUser);
this.loadCountries();
        this.profileForm.patchValue({
          firstName: first,
          lastName: last,
          email: this.currentUser.user.email,   // API not providing email
          phone: data.phone,
          country: data.country,
          address: data.street,
          city: data.city,
          postcode: data.postal_code
        });
        }
        
      }

    })
  }

  loadCountries() {
    this.globalFunctionService.getCountries().subscribe((res:any)=>{
    this.countries = res.data;
    console.log('res====>',this.countries);
    this.getCities();
    // this.states = this.countries[98].states;
  })
}
getCities(){
   this.globalFunctionService.getCities("India", 'Uttar Pradesh')
    .subscribe(cities => {
      this.cities = cities;
    });
}
}
