
import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { QuillModule } from 'ngx-quill';
import { catchError, of } from 'rxjs';
import { DataService } from 'shared-lib';
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
  
newPage:any=
  {
    
   "title":"About Us",
   "description":"Services description",
   "slug":"about-us",
   "pageContent":"this will be ritch text",
   "seoData":{
    "keywords":"",
    "metaTitle":"",
    "metaDescription":""
   
    
   }

}
  constructor() {
  
   }

  ngOnInit() {
  }

 addPage(){
    let payload= {
          settings_name:this.newPage.slug,
          settings:this.newPage
        }
        this.dataService.post(payload, 'settings')
          .pipe(
            catchError(err => {
              console.error('Error:', err);
              return of(null);
            })
          )
          .subscribe((res: any) => {
            console.log('Response:', res);
            if (res.data) {
    
            
            }
         
          });
}



}
