import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { Sidebar } from "../../layout/sidebar/sidebar";
import { Header } from "../../layout/header/header";
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DataService } from 'shared-lib';
import { catchError, of } from 'rxjs';

@Component({
  selector: 'app-category',
  templateUrl: './category.html',
  styleUrl: './category.scss',
  standalone:false,
})
export class Category {
  public dataService: any = inject(DataService);
  addCategory!: FormGroup;
  imageFile: File | null = null;
  imagePreview: string | ArrayBuffer | null = null;
  categoryListData: any;
  constructor(private fb: FormBuilder,private cd:ChangeDetectorRef ) {
    this.addCategoryForm();
  }
  addCategoryForm() {
    this.addCategory = this.fb.group({
      name: ['', [Validators.required]],
      mainCategory: ['',Validators.required],
      categoryThumbnail: [''],
      customCategoryIcon: [''],
      description: ['', [Validators.minLength(30)]],
      displayType: ['',Validators.required],

    });
  }
  onImageChange(event: any): void {
    const file = event.target.files?.[0];
    if (file) {
      this.imageFile = file;
      const objectURL = URL.createObjectURL(file);
      this.imagePreview = objectURL;
    }
  }
ngOnInit(){
  this.getCategoryList();
}
  saveCategoryData() {
    const formData = new FormData();
    if (this.imageFile) {
      formData.append('categoryThumbnail', this.imageFile);
    }
    Object.keys(this.addCategory.value).forEach(key => {
      if (key !== 'categoryThumbnail') {
        formData.append(key, this.addCategory.value[key]);
      }
    });

    for (let pair of formData.entries()) {
      console.log(pair[0], pair[1]);
    }

    this.dataService.callApiWithFormData(formData, 'categories')
      .pipe(
        catchError(err => {
          console.error('Error:', err);
          return of(null);
        })
      )
      .subscribe((res: any) => {
        console.log('Response:', res);
        this.getCategoryList();
      });
  }
  getCategoryList(){
     this.dataService.callGetApi('categories')
      .pipe(
        catchError(err => {
          console.error('Error:', err);
          return of(null);
        })
      )
      .subscribe((res: any) => {
        console.log('Response:', res);
        this.categoryListData = res.data;
        this.cd.detectChanges(); 
      });
  }

}
