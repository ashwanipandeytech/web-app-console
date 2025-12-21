
import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-pages',
  templateUrl: './pages.component.html',
  imports: [FormsModule, CommonModule],
  styleUrls: ['./pages.component.scss'],
  standalone:true
})
export class PageList implements OnInit {
settings:any=FormGroup;
pageList:any=[
  {
    
   "title":"About Us",
   "description":"Services description",
   "slug":"about-us",
   "pageContent":"this will be ritch text",
   "seoData":{
    
   }

},
{
   "title":"Privacy Policy",
   "description":"Privacy description",
   "slug":"privacy",
   "pageContent":"this will be ritch text",
   "seoData":{
    
   }

},
{
   "title":"Services",
   "description":" Services description",
   "slug":"services",
   "pageContent":"this will be ritch text",
   "seoData":{
    
   }

}
]
  constructor(private router: Router,private cdr: ChangeDetectorRef) {
  
   }

  ngOnInit() {
    console.log(this.pageList)
   this.cdr.detectChanges()
  }

 
viewPage(page: any) {
  console.log('View Page:', page);
  // open modal or navigate to detail page
}

editPage(page: any) {
  console.log('Edit Page:', page);
  // navigate to edit page
  this.router.navigate(['/edit-page', page.slug]);
}

deletePage(index: number) {
  if (confirm('Are you sure you want to delete this page?')) {
    this.pageList.splice(index, 1);
  }
}
addPage(){
  this.router.navigate(['/add-page']);
} 




}
