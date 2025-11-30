import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { catchError, of } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { DataService } from 'shared-lib';

@Component({
  selector: 'app-category',
  imports: [],
  templateUrl: './category.html',
  styleUrl: './category.scss'
})
export class Category {
  public dataService:any= inject(DataService);
  categoryListData:any;
  baseURL: string;

  constructor(private cd:ChangeDetectorRef){
    this.getCategoryList();
    this.baseURL=environment.DOMAIN;
  }
  
  getCategoryList() {
    console.log('environment.API_URL==>', environment);
    this.categoryListData = [];
    this.dataService.callGetApi('categories')
    .pipe(
      catchError(err => {
        console.error('Error:', err);
        return of(null);
      })
    )
    .subscribe((res: any) => {
      console.log('Response:', res);
      if (res.data) {

        for (let i = 0; i < res.data.length; i++) {
          const element = res.data[i];
          console.log('element==>', element.thumbnail);
          if (element?.thumbnail != null) {
            
            element.thumbnail = environment.DOMAIN + '/' + element.thumbnail;
          }
          this.categoryListData.push(element);
        }
      }
      console.log('categoryListData==>', this.categoryListData);

      this.cd.detectChanges();
      // this.categoryListData = res.data;
    });
  }
  back(){
    window.history.back();
  }
}
