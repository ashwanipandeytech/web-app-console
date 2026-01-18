import { ChangeDetectorRef, Component, inject, Inject, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { catchError, of } from 'rxjs';
import { DataService } from '../../services/data-service';
import { PlatformDetectionService } from '../../services/platform-detection';
import { isPlatformBrowser } from '@angular/common';
import { MobileBottomNavComponent } from '../mobile-bottom-nav/mobile-bottom-nav.component';

@Component({
  selector: 'web-category',
  imports: [MobileBottomNavComponent],
  templateUrl: './category.html',
  styleUrl: './category.scss'
})
export class CategoryCommon {
  categoryListData: any;
  platFormType:string;
  public dataService:any= inject(DataService);
  public platformDetectionService:any= inject(PlatformDetectionService);
  private route = inject(Router);
  isBrowser: boolean;
private platformId = inject(PLATFORM_ID);
  imgUrl: string='';
  constructor(private cd:ChangeDetectorRef, private router: Router, ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    this.platFormType= this.platformDetectionService.getActivePlatform()
    console.info('this.platFormType',this.platFormType)
    this.imgUrl = environment.DOMAIN;
  }

  ngOnInit(){
    this.getCategoryList();
  }
  
  getCategoryList() {
    this.categoryListData = [];
    this.dataService.get('categories')
      .pipe(
        catchError(err => {
          console.error('Error:', err);
          return of(null);
        })
      )
      .subscribe((res: any) => {
        if (res.success == true) {
          console.log('Response:', res);
          this.categoryListData = res.data;
        // this.categoryListData = res.data.map((item:any)=>{
        //            item.thumbnail = environment.DOMAIN + '/' + item.thumbnail;
        //            return item;
        // })
        console.log('this.categoryListData==>',this.categoryListData);
        
          // for (let i = 0; i < res.data.length; i++) {
          //   const element = res.data[i];
          //   //console.log('element==>', element.thumbnail);
          //   // if (element?.thumbnail != null) {
          //   //   //console.log('environment.API_URL==>', environment.API_URL);
          //   //   element.thumbnail = environment.DOMAIN + '/' + element.thumbnail;
          //   // }
          //   this.categoryListData.push(element);
          // }
          this.cd.detectChanges();
        }
        //console.log('categoryListData==>', this.categoryListData);

      });
  }
  back(){
    if (this.isBrowser) {
      window.history.back();
    }
  }

  gotoCategory(id: any) {
    this.route.navigate(['/category-details', id]);
  }


}
