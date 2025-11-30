import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { catchError, of } from 'rxjs';
import { DataService } from '../../services/data-service';

@Component({
  selector: 'web-category',
  imports: [],
  templateUrl: './category.html',
  styleUrl: './category.scss'
})
export class CategoryCommon {
  categoryListData: any;
  public dataService:any= inject(DataService);

  constructor(private cd:ChangeDetectorRef, private router: Router) {}

  ngOnInit(){
    this.getCategoryList();
  }
  
  getCategoryList() {
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
              console.log('environment.API_URL==>', environment.API_URL);
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
