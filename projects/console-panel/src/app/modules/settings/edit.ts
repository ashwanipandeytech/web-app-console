
import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { QuillModule } from 'ngx-quill';
import { catchError, of } from 'rxjs';
import { DataService } from 'shared-lib';
import { GlobalService } from '../../global.service';
@Component({
  selector: 'app-editpage',
  templateUrl: './edit.html',
  imports: [FormsModule, CommonModule,QuillModule],
  styleUrls: ['./edit.scss'],
  standalone:true
})
export class EditPage implements OnInit {
   public dataService: any = inject(DataService);
  
   private route: ActivatedRoute = inject(ActivatedRoute);
  private router: Router = inject(Router);
settings:any=FormGroup;
newPage:any

  constructor(private cdr: ChangeDetectorRef,private globalService:GlobalService) {
  
   }

  ngOnInit() {
  let slug = this.route.snapshot.params['id']
  
      this.dataService.get('pages/'+slug)
      .pipe(
        catchError(err => {
            this.globalService.showMsgSnackBar(err);
          console.error('Error:', err);
          return of(null);
        })
      )
      .subscribe((res: any) => {
        // console.log('Response:', res.data);
        if (res.success) {
          this.newPage = res.data.settings;
        
          this.cdr.detectChanges()
        }

      });

  }

 updatePage(){
  console.info('this.newPage',this.newPage)
   let payload= {
        settings_name:this.newPage.slug,
        settings:this.newPage
      }
      this.dataService.post(payload, 'pages')
        .pipe(
          catchError(err => {
            console.error('Error:', err);
            return of(null);
          })
        )
        .subscribe((res: any) => {
          console.log('Response:', res);
           this.globalService.showMsgSnackBar(res);
           this.router.navigate(['/pages']);
       
        });
}



}
