import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, inject, ViewChild } from '@angular/core';
import { Sidebar } from "../../layout/sidebar/sidebar";
import { Header } from "../../layout/header/header";
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';

import { DataService } from 'shared-lib';
import { catchError, of } from 'rxjs';
import { environment } from 'environments/environment';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationPopupComponent } from '../../confirmationPopup/confirmationPopup.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { GlobalService } from '../../global.service';

@Component({
  selector: 'app-category',
  templateUrl: './category.html',
  styleUrl: './category.scss',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Category {
  @ViewChild('fileInput') fileInput!: ElementRef;
  isEdit:boolean=false;
  readonly dialog = inject(MatDialog);
  public dataService: any = inject(DataService);
  addCategory!: FormGroup;
  imageFile: File | null = null;
  imagePreview: string | ArrayBuffer | null = null;
  categoryListData: any = [];
  updateCategoryId: any;
  constructor(private fb: FormBuilder, private cd: ChangeDetectorRef,private globalService:GlobalService) {
    this.addCategoryForm();
  }
  addCategoryForm() {
   this.addCategory = this.fb.group({
  name: ['', [Validators.required, Validators.minLength(3)]],

  // parent_id: ['', Validators.required],

  categoryThumbnail: ['', Validators.required], // for file upload
  customCategoryIcon: [''],

  description: [''],

  // display_type: ['', Validators.required],

  is_menu: [false, Validators.requiredTrue], // checkbox must be checked

  allow_on: ['', Validators.required]
});
  }
  onImageChange(event: any): void {
    const file = event.target.files?.[0];
    if (file) {
      this.addCategory.patchValue({ categoryThumbnail: file });
    this.addCategory.get('categoryThumbnail')?.updateValueAndValidity();
      this.imageFile = file;
      const objectURL = URL.createObjectURL(file);
      this.imagePreview = objectURL;
    }
  }
  ngOnInit() {
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
            setTimeout(() => {
          this.globalService.showMsgSnackBar(err);
        }, 100);
          return of(null);
        })
      )
      .subscribe((res: any) => {
        console.log('Response:', res);
        this.addCategory.reset();
          if (this.fileInput) {
    this.fileInput.nativeElement.value = '';
  }
        this.imagePreview = '';
        this.imageFile = null;
        this.getCategoryList();
        setTimeout(() => {
          this.globalService.showMsgSnackBar(res);
        }, 100);
      });
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

  openDialog(id: any): void {
    let popupData = {
      title: 'Category',
      description: 'Are you sure, you want to delete catrgory',
      id: id
    }
    let dialogRef = this.dialog.open(ConfirmationPopupComponent, {
      width: '250px',
      data: popupData,
    });
    dialogRef.afterClosed().subscribe(result => {
      console.log('Dialog closed with:', result);

      if (result.action === 'delete') {
        // Perform delete
        this.deleteCategory(result.id);

      }
    })
  }
  editCategory(item:any){
    this.isEdit = true;
    this.updateCategoryId = item.id;
  this.addCategory.patchValue(item);
  }
  updatecategory(){
    // let formData = this.addCategory.value;
    // formData.id = this.updateCategoryId;
    let formValue = this.addCategory.value;


     const formData = new FormData();
     formData.append('_method', 'PUT');
    if (this.imageFile) {
      formData.append('categoryThumbnail', this.imageFile);
    }
    Object.keys(this.addCategory.value).forEach(key => {
      if (key !== 'categoryThumbnail') {
        formData.append(key, this.addCategory.value[key]);
      }
    });
// Add ID for update
// formValue.id = this.updateCategoryId;
// const form = new FormData();

// Laravel-style method spoofing
// form.append('_method', 'PUT');

// // Append normal text fields
// form.append('id', formValue.id);
// form.append('name', formValue.name);
// form.append('parent_id', formValue.parent_id);
// form.append('description', formValue.description);
// form.append('display_type', formValue.display_type);
// form.append('customCategoryIcon', formValue.customCategoryIcon);


// Append files ONLY if user selected them
// if (formValue.categoryThumbnail instanceof File) {
//   form.append('categoryThumbnail', formValue.categoryThumbnail);
// }

// if (formValue.customCategoryIcon instanceof File) {
//   form.append('customCategoryIcon', formValue.customCategoryIcon);
// }
     this.dataService.callUpdateApi('categories', formData,this.updateCategoryId)
      .pipe(
        catchError(err => {
          console.error('Error:', err);
           setTimeout(() => {
          this.globalService.showMsgSnackBar(err);
        }, 100);
          return of(err);
        })
      )
      .subscribe((res: any) => {
        console.log('Response:', res);
        if (res.error) {
          this.globalService.showMsgSnackBar(res.err);
          
        }

else{
  
        this.getCategoryList();
        setTimeout(() => {
          this.globalService.showMsgSnackBar(res);
        }, 100);
        this.cd.detectChanges();
}


        // this.categoryListData = res.data;
      });
  }
  deleteCategory(id: any) {
    this.dataService.callDeleteApi('categories', id)
      .pipe(
        catchError(err => {
          console.error('Error:', err);
           setTimeout(() => {
          this.globalService.showMsgSnackBar(err);
        }, 100);
          return of(null);
        })
      )
      .subscribe((res: any) => {
        console.log('Response:', res);
        this.getCategoryList();
          setTimeout(() => {
          this.globalService.showMsgSnackBar(res);
        }, 100);
        this.cd.detectChanges();
        // this.categoryListData = res.data;
      });
  }
  clearForm(){
    this.addCategory.reset();
  if (this.fileInput) {
    this.fileInput.nativeElement.value = '';
    this.imagePreview = '';
  }
    this.isEdit = false;
  }
  get f() {
  return this.addCategory.controls;
}
}
