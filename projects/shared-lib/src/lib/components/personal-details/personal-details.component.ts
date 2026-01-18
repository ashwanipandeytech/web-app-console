import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  effect,
  inject,
  Inject,
  OnInit,
  PLATFORM_ID,
} from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DataService } from '../../services/data-service';
import { catchError, of } from 'rxjs';
import { GlobalFunctionService } from '../../services/global-function.service';
import { GlobaCommonlService } from '../../services/global-common.service';
import { SignalService } from '../../services/signal-service';
import { CommonModule, isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-personal-details',
  templateUrl: './personal-details.component.html',
  imports: [ReactiveFormsModule, CommonModule],
  styleUrls: ['./personal-details.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PersonalDetailsComponent implements OnInit {
  profileForm!: FormGroup;
  private fb = inject(FormBuilder);
  private dataService = inject(DataService);
  private signalService = inject(SignalService);
  private cd = inject(ChangeDetectorRef);
  private globalService = inject(GlobaCommonlService);
  private globalFunctionService = inject(GlobalFunctionService);
  currentUser: any;
  profileListData: any = [];
  countries: any = [];
  states: any;
  cities: any = [];
  isLoading: boolean = true;
  isBrowser: boolean;
  private platformId = inject(PLATFORM_ID);
  constructor() {
    this.isBrowser = isPlatformBrowser(this.platformId);

    effect(() => {
      if (this.signalService.userLoggedIn()) {

    this.profileDetailsForm();
        this.getProfileList();
        this.cd.detectChanges();
      }

    });
  }

  ngOnInit() {
    if (this.isBrowser) {
      let isLoggedIn = JSON.parse(localStorage.getItem('isLoggedIn') || 'null');

      if (!isLoggedIn) {

        this.signalService.openLoginPopup.set(true)
        return;

      }

      this.profileDetailsForm();

      this.currentUser = JSON.parse(localStorage.getItem('user') || 'null');
      //console.log('currentUser===>',this.currentUser);
    }
  }

  profileDetailsForm() {
    if (this.isBrowser) {
      let userLoginData = JSON.parse(localStorage.getItem('user') || 'null');
      // let firstName = userLoginData.user.firstName.split(' ');
      // //console.log('firstName==>',firstName);
    }

    this.profileForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      // country: ['India', Validators.required],
      // address: ['', Validators.required],
      // city: ['', Validators.required],
      // postcode: ['', [Validators.required, Validators.pattern(/^[0-9]{4,10}$/)]],
      //logo: [null], // file input
    });
    //  this.loadCountries();
    this.getProfileList();
    this.cd.detectChanges();
  }
  get phone() {
    return this.profileForm.get('phone');
  }
  get postcode() {
    return this.profileForm.get('postcode');
  }

  onFileChange(event: any) {
    const file = event.target.files[0];
    this.profileForm.patchValue({ logo: file });
  }

  submitForm() {
    //console.log('this.profileForm.invalid==>',this.profileForm.invalid);

    // if (this.profileForm.invalid) {
    //   this.profileForm.markAllAsTouched();
    //   return;
    // }
    // if (this.profileForm.valid) {
    //console.log(this.profileForm.value);
    let fullAddrress = this.profileForm.value;
    // fullAddrress.location = '';
    // fullAddrress.label = 'home';
    // fullAddrress.isDefault = 1;
    fullAddrress.name = fullAddrress.firstName + ' ' + fullAddrress.lastName;
    fullAddrress.phone = fullAddrress.phone.toString()
    // fullAddrress.postcode=fullAddrress.postcode.toString()
    // console.info('fullAddrress',fullAddrress)
    this.dataService
      .put(fullAddrress, 'profile')
      .pipe(
        catchError((err) => {
          console.error('Error:', err);
          //  this.globalService.showMsgSnackBar(err);
          return of(null);
        })
      )
      .subscribe((res: any) => {
        //console.log('Response:', res);
        // this.globalService.showMsgSnackBar(res);
        if (res.success == true) {
          this.globalService.showMsgSnackBar(res);
          if (this.isBrowser) {
            let userData: any = localStorage.getItem('user');

            let userObj = JSON.parse(userData);

            userObj.user.name = fullAddrress.name;
            userObj.user.phone = fullAddrress.phone;
            userObj.user.email = fullAddrress.email;

            // 4. Save updated object back to localStorage

            localStorage.setItem('user', JSON.stringify(userObj));
            console.log('Updated User:', JSON.parse(localStorage.getItem('user')!));
          }

          this.signalService.profileChanged.set(fullAddrress.name);

          // this.router.navigate(['/cart']);
        } else if (res.error && res.error.message) {
          //console.log('error  :', res.error.message);
          this.globalService.showMsgSnackBar(res.error);
        }
      });
    // }
    this.isEditMode = false;
  }

  getProfileList() {
    this.isLoading = true;
    this.dataService
      .get('profile')
      .pipe(
        catchError((error) => {
          console.error('Profile API error:', error);
          return of(null); // ✅ always return an observable
        })
      )
      .subscribe((response: any) => {
        if (!response || response.success !== true) {
          return;
        }

        this.profileListData = response.data?.data;
        if (!this.profileListData) {
          return;
        }

        //console.log('profileListData ==>', this.profileListData);

        // ✅ Safe address access
        // const data = this.profileListData.addresses?.[0] ?? {};
        const data =
          this.profileListData.addresses?.find((addr: any) => addr.is_default == 1) ?? {};

        //console.log('data==>',data);

        // ✅ Safe name split
        const fullName = this.profileListData.name?.trim().split(' ') ?? [];
        const first = fullName[0] ?? '';
        const last = fullName.slice(1).join(' ') ?? '';
        const email = this.profileListData.email;
        const phone = this.profileListData.phone;

        console.info('cities', this.cities, data.city);
        if (this.profileListData && response.success) {
          // ✅ patchValue is safe even if fields are empty
          this.profileForm.patchValue({
            firstName: first,
            lastName: last,
            email: email,
            phone: phone,
            // country: data.country ?? '',
            // address: data.street ?? '',
            // city: data.city ?? '',
            // postcode: data.postal_code ?? '',
          });
          this.isLoading = false;

          this.cd.detectChanges();
        }
      });
  }

  loadCountries() {
    this.globalFunctionService.getCountries().subscribe((res: any) => {
      this.countries = res.data;
      //console.log('res====>',this.countries);
      this.getCities();
      this.cd.detectChanges();

      // this.states = this.countries[98].states;
    });
  }
  getCities() {
    this.globalFunctionService.getCities('India', 'Uttar Pradesh').subscribe((cities) => {
      this.cities = cities;
      //  this.getProfileList();
      // this.cd.detectChanges();
    });
  }

  isEditMode = false;
  toggleEdit() {
    this.isEditMode = !this.isEditMode;
  }
}
