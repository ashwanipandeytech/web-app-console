import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { catchError, of } from 'rxjs';
import { DataService } from '../../services/data-service';
import { PlatformDetectionService } from '../../services/platform-detection';

@Component({
  selector: 'web-category',
  imports: [],
  templateUrl: './category.html',
  styleUrl: './category.scss'
})
export class CategoryCommon {
  categoryListData: any;
  platFormType:string;
  public dataService:any= inject(DataService);
  public platformDetectionService:any= inject(PlatformDetectionService);
  private route = inject(Router);

  constructor(private cd:ChangeDetectorRef, private router: Router) {
    this.platFormType= this.platformDetectionService.getActivePlatform()
    console.info('this.platFormType',this.platFormType)
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
        //console.log('Response:', res);
        if (res.data) {

          for (let i = 0; i < res.data.length; i++) {
            const element = res.data[i];
            //console.log('element==>', element.thumbnail);
            if (element?.thumbnail != null) {
              //console.log('environment.API_URL==>', environment.API_URL);
              element.thumbnail = environment.DOMAIN + '/' + element.thumbnail;
            }
            this.categoryListData.push(element);
          }
        }
        //console.log('categoryListData==>', this.categoryListData);

        this.cd.detectChanges();
        // this.categoryListData = res.data;
      });
  }
  back(){
    window.history.back();
  }

  gotoCategory(id: any) {
    this.route.navigate(['/category-details', id]);
  }


}
