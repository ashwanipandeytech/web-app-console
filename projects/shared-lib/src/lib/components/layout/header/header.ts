import { ChangeDetectorRef, Component, effect, inject, Inject, PLATFORM_ID } from '@angular/core';
import { Router, RouterLink, RouterModule } from '@angular/router';
import { DataService } from '../../../services/data-service';
import { catchError, of } from 'rxjs';
import { GlobalFunctionService } from '../../../services/global-function.service';
import { AddAddressModal } from '../../../model/add-address-modal/add-address-modal';
import { SignalService } from '../../../services/signal-service';
import { JsonPipe, NgTemplateOutlet, CommonModule, isPlatformBrowser } from '@angular/common';
import { NgbModal, NgbModalRef, NgbSlide } from '@ng-bootstrap/ng-bootstrap';
import { Login } from '../../auth/login/login';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'web-header',
  imports: [
    RouterLink,
    RouterModule,
    JsonPipe,
    NgTemplateOutlet,
    NgbSlide,
    CommonModule,
    FormsModule,
  ],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {
  private route = inject(Router);
  readonly dataService = inject(DataService);
  private globalFunctionService = inject(GlobalFunctionService);
  private signalService = inject(SignalService);
  readonly ngbModal = inject(NgbModal);
  private cd = inject(ChangeDetectorRef);
  
  isLoggedIn: any = false;
  cartItemCount: any = 0;
  userName: any;
  categoryListData: any;
  countsList: any;
  searchText = '';
  categories: any[] = [];
  baseUrl = environment.DOMAIN;
  currentAddress: any;



  isBrowser: boolean;  
  private platformId = inject(PLATFORM_ID);
  constructor() {
    this.isBrowser = isPlatformBrowser(this.platformId);




    this.globalFunctionService.getCount();

    effect(() => {
      this.signalService.openLoginTrigger(); // track trigger

      const shouldOpen = this.signalService.openLoginPopup();
      if (shouldOpen) {
        this.openLogin();
        this.cd.detectChanges();
      }
    });

    effect(() => {
      this.isLoggedIn = this.signalService.userLoggedIn();
      if (this.signalService.allCounts() != null) {
        this.countsList = this.signalService.allCounts();
        this.cd.detectChanges();
      }

      if (this.signalService.currentLocation() != null) {
        this.currentAddress = this.signalService.currentLocation();
        this.cd.detectChanges();
      }
      // else{
      // if (localStorage.getItem('currentLocation')) {
      //   this.currentAddress = localStorage.getItem('currentLocation');
      // }
      // }

    });
    const address = effect(() => {
      if (this.signalService.currentLocation() != null) {
        this.currentAddress = this.signalService.currentLocation();
        this.cd.detectChanges();
      }
      else {
        if (this.isBrowser && localStorage.getItem('currentLocation')) {
          this.currentAddress = localStorage.getItem('currentLocation');
          this.cd.detectChanges();
        }
      }
    })

    effect(() => {
      //console.log('fsgfdgvdfgdfgfdgf',this.signalService.user());

      if (this.signalService.user() != null) {
        this.userName = this.signalService.user().user.name;
        this.cd.detectChanges();
      }
      // else{
      //      if (localStorage.getItem('user')) {
      //   this.currentAddress = localStorage.getItem('currentLocation');
      //   this.cd.detectChanges();
      // }
      // }
    })

    let profileUpdate = effect(() => {
      if (this.signalService.profileChanged()) {
        this.userName = this.signalService.profileChanged();
        this.cd.detectChanges();
      }

    })

    //  else {
    //   this.currentAddress = this.signalService.currentLocation();
    // }

    //  effect(() => {
    //   // //console.log('Cart count changed:', this.signalService.cartCounts());
    //   if (this.signalService.userLoggedIn() ) {
    //     //console.log('this.signalService.userLoggedIn()==>',this.signalService.userLoggedIn());

    //     this.countsList = this.signalService.allCounts();
    //     this.cd.detectChanges();
    //   }
    // });
    //use effect for getting the userState signal

    //step1 if user is found logged in
    //call carlist api to show the cart list count
    //call wishlist api to show the wishlist count

    //use effect for getting the CART ADDED signal
    //call carlist api to show the cart list count
  }

  ngOnInit() {
    if (this.isBrowser) {
      let userData: any = localStorage.getItem('user');
      let isLoggedIn: any = localStorage.getItem('isLoggedIn');
      if (userData == null) {
        this.isLoggedIn = false;
      } else {
        this.isLoggedIn = isLoggedIn;
        this.signalService.userLoggedIn.set(true);
        this.userName = JSON.parse(userData).user.name;
        this.cd.detectChanges();
      }
    }
    //       if (localStorage.getItem('currentLocation')) {
    //   this.currentAddress = localStorage.getItem('currentLocation');
    // }
    // this.carList();
    this.getCategoryList();
    // this.getCartCount();
    // this.globalFunctionService.cartCount$.subscribe(data => {
    // if (data) {
    // let countss = this.signalService.cartCounts;
    // this.countsList = countss();
    // //console.log('this.countsList===>',this.countsList);

    //   }
    // });
  }

  gotoCategory(id: any) {
    this.route.navigate(['/category-details', id]);
  }
  openDashboard() {
    if (this.isLoggedIn) {
      this.route.navigate(['/user-profile.html']);
    } else {
      // this.route.navigate(['/login']);
      this.openLogin();
    }
  }
  logout() {
    if (this.isBrowser) {
      localStorage.clear();

      this.route.navigate(['/']).then(() => {
        window.location.reload();
      });
      // window.location.reload();
    }
  }

  searchCategory() {
    if (!this.searchText.trim()) return;

    const matchedCategory = this.categoryListData.find((cat: { name: string }) =>
      // cat.name.toLowerCase() === this.searchText.toLowerCase()
      cat.name.toLowerCase().includes(this.searchText.toLowerCase())
    );

    if (matchedCategory) {
      // redirect to category page
      // this.route.navigate(['/category', matchedCategory.id]);
      this.route.navigate(['/category-details', matchedCategory.id]);
    } else {
      alert('Category not found');
    }
  }
  getCategoryList() {
    this.categoryListData = [];
    this.dataService
      .get('categories/menu')
      .pipe(
        catchError((err) => {
          console.error('Error:', err);
          return of(null);
        })
      )
      .subscribe((res: any) => {
        if (res.data) {
          this.categoryListData = res.data;
          //console.log('this.categoryListData===>',res.data);
          // for (let i = 0; i < res.data.length; i++) {
          //   const element = res.data[i];
          //   // if (element?.thumbnail != null) {
          //   //   element.thumbnail = environment.DOMAIN + '/' + element.thumbnail;
          //   // }
          //   this.categoryListData.push(element);
          // }
        }
        this.cd.detectChanges();
        // this.categoryListData = res.data;
      });
  }
  carList() {
    this.dataService
      .get('cart')
      .pipe(
        catchError((error) => {
          return of(null); // or you can return a default value if needed
        })
      )
      .subscribe((response: any) => {
        //console.log('response==>', response);
        if (response.success == true) {
          this.cartItemCount = response.data.data.length;
          this.cd.detectChanges();
        }
      });
  }
  //   getCartCount(){
  //     this.dataService.get('user/overview-counts').subscribe((res:any)=>{
  //       //console.log('res====>',res);
  //       this.countsList = res.data;
  //     })
  //   // this.dataService.get((data)=>{
  //   //   this.arrCartLength = data
  //   //   this.cdr.detectChanges();
  //   // });
  // }

  openAddressPopup(from: any = '') {
    const modalRef: NgbModalRef = this.ngbModal.open(AddAddressModal, {
      windowClass: 'mobile-modal',
      scrollable: true,
      centered: true
    });
    modalRef.componentInstance.isfrom = from;
    modalRef.result
      .then((result) => {
        //console.log('Modal closed with result:', result);
      })
      .catch((reason) => {
        //console.log('Modal dismissed:', reason);
      });
  }
  openLogin() {


    setTimeout(() => {
      let isLogginOpened: any = null;
      let isLoggedIn: any = null;
      if (this.isBrowser) {
        isLogginOpened = document.getElementById('loginOpened');
        isLoggedIn = JSON.parse(localStorage.getItem('isLoggedIn') || 'null');
      }

      if (!isLogginOpened && !isLoggedIn) {
        const modalRef: NgbModalRef = this.ngbModal.open(Login, {
          windowClass: 'mobile-modal login-popup',
          scrollable: true,
          centered: true
        });
        modalRef.result
          .then((result) => {
            //console.log('Modal closed with result:', result);
          })
          .catch((reason) => {
            //console.log('Modal dismissed:', reason);
          });
      }

    }, 200);

  }
}
