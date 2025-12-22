
import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { QuillModule } from 'ngx-quill';
import { catchError, of } from 'rxjs';
import { DataService } from 'shared-lib';
import { GlobalService } from '../../global.service';
@Component({
  selector: 'app-addpage',
  templateUrl: './add.html',
  imports: [FormsModule, CommonModule,QuillModule],
  styleUrls: ['./add.scss'],
  standalone:true
})
export class AddPage implements OnInit {
settings:any=FormGroup;
 public dataService: any = inject(DataService);
    private router: Router = inject(Router);
newPage:any=
  {
    
   "title":"",
   "description":"",
   "slug":"",
   "pageContent":"",
   "seoData":{
    "keywords":"",
    "metaTitle":"",
    "metaDescription":""
   
    
   }

}
  constructor(private globalService:GlobalService) {
  
   }

  ngOnInit() {
  }

 addPage(){
    let payload= {
          settings_name:this.newPage.slug,
          settings:this.newPage
        }
        this.dataService.post(payload, 'pages')
          .pipe(
            catchError(err => {
                this.globalService.showMsgSnackBar(err);
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
