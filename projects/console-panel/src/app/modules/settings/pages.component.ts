
import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { catchError, of } from 'rxjs';
import { DataService } from 'shared-lib';
import { GlobalService } from '../../global.service';
@Component({
  selector: 'app-pages',
  templateUrl: './pages.component.html',
  imports: [FormsModule, CommonModule],
  styleUrls: ['./pages.component.scss'],
  standalone: true
})
export class PageList implements OnInit {
  settings: any = FormGroup;
  public dataService: any = inject(DataService);
  pageList: any = [

  ]
  constructor(private router: Router, private cdr: ChangeDetectorRef,private globalService:GlobalService) {

  }

  ngOnInit() {
    this.dataService.get('pages/list')
      .pipe(
        catchError(err => {
          console.error('Error:', err);
          return of(null);
        })
      )
      .subscribe((res: any) => {
        //console.log('Response:', res);
        if (res.data) {
          this.pageList = res.data;
          this.cdr.detectChanges()
        }

      });

  }


  viewPage(page: any) {
    //console.log('View Page:', page);
    // open modal or navigate to detail page
  }

  editPage(page: any) {
    //console.log('Edit Page:', page);
    // open add page and bind data for editing
    this.router.navigate(['/add-page'], {
      queryParams: { slug: page.slug, mode: 'edit' }
    });
  }

  deletePage(index: number) {
    if (confirm('Are you sure you want to delete this page?')) {
     

       this.dataService.delete(`pages/${this.pageList[index].slug}`)
      .pipe(
        catchError(err => {
          console.error('Error:', err);
          return of(null);
        })
      )
      .subscribe((res: any) => {
        //console.log('Response:', res);
        if (res.success) {
         this.globalService.showMsgSnackBar(res);
          this.pageList.splice(index, 1);
          this.cdr.detectChanges()
        }

      });
    }
  }
  addPage() {
    this.router.navigate(['/add-page']);
  }




}
