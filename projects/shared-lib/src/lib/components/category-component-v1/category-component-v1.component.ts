import { ChangeDetectorRef, Component, inject, Input, OnInit } from '@angular/core';
import { environment } from '../../environments/environment';
import { DataService } from '../../services/data-service';
import { catchError, of } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-category-component-v1',
  templateUrl: './category-component-v1.component.html',
  styleUrls: ['./category-component-v1.component.scss'],
})
export class CategoryComponentV1Component implements OnInit {
  @Input() data: any;
  private dataService = inject(DataService);
  private cd = inject(ChangeDetectorRef);
  private route = inject(Router);
  categoryListData: any = [];
  constructor() {
    console.log('CategoryComponentV1Component Load');
  }

  ngOnInit() {
    this.getCategoryList();
  }

  getCategoryList() {
    this.categoryListData = [];
    this.dataService
      .get('categories')
      .pipe(
        catchError((err) => {
          console.error('Error:', err);
          return of(null);
        })
      )
      .subscribe((res: any) => {
        if (res.data) {
          for (let i = 0; i < res.data.length; i++) {
            const element = res.data[i];
            if (element?.thumbnail != null) {
              element.thumbnail = environment.DOMAIN + '/' + element.thumbnail;
            }
            this.categoryListData.push(element);
          }
        }
        this.cd.detectChanges();
        // this.categoryListData = res.data;
      });
  }
  gotoCategory(id: any) {
    this.route.navigate(['/category-details', id]);
  }
}
