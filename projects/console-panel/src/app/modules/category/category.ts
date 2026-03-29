import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, HostListener, inject, TemplateRef, ViewChild } from '@angular/core';
import { Sidebar } from "../../layout/sidebar/sidebar";
import { Header } from "../../layout/header/header";
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';

import { DataService } from 'shared-lib';
import { catchError, of } from 'rxjs';
import { environment } from 'environments/environment';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ConfirmationPopupComponent } from '../../confirmationPopup/confirmationPopup.component';
import { GlobalService } from '../../global.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-category',
  templateUrl: './category.html',
  styleUrl: './category.scss',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Sidebar, Header, FormsModule, ReactiveFormsModule,CommonModule],
})
export class Category {
  @ViewChild('fileInput') fileInput!: ElementRef;
  @ViewChild('categoryPreviewModal') categoryPreviewModal!: TemplateRef<any>;
  isEdit:boolean=false;
  private readonly ngbModal = inject(NgbModal);
  previewDialogRef?: NgbModalRef;
  selectedCategory: any;
  public dataService: any = inject(DataService);
  addCategory!: FormGroup;
  imageFile: File | null = null;
  imagePreview: string | ArrayBuffer | null = null;
  categoryListData: any = [];
  updateCategoryId: any;
  constructor(private fb: FormBuilder, private cd: ChangeDetectorRef,private globalService:GlobalService) {
    this.addCategoryForm();
  }
    @HostListener('window:beforeunload', ['$event'])
unloadNotification($event: BeforeUnloadEvent) {
  if (this.addCategory?.dirty) {
    $event.preventDefault();
    $event.returnValue = true; // triggers browser alert
  }
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

   confirmBeforeSaveCategory(action:any){
     const confirmed = confirm(`Are you sure you want to ${action} this Category?`);
    if (!confirmed) {
      return; 
    }
    if (action == 'update') {
      this.updatecategory();
    }
    else{
      this.saveCategoryData();
    }
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
      //console.log(pair[0], pair[1]);
    }

    this.dataService.postForm('categories',formData)
      .pipe(
        catchError(err => {
          console.error('Error:', err);
            setTimeout(() => {
          this.globalService.showToast(err);
        }, 100);
          return of(null);
        })
      )
      .subscribe((res: any) => {
        //console.log('Response:', res);
        this.addCategory.reset();
          if (this.fileInput) {
    this.fileInput.nativeElement.value = '';
  }
        this.imagePreview = '';
        this.imageFile = null;
        this.getCategoryList();
        setTimeout(() => {
          this.globalService.showToast(res);
        }, 100);
      });
  }
  getCategoryList() {
    
    this.categoryListData = [];
    this.dataService.get('categories')
      .pipe(
        catchError(err => {
          console.error('Error:', err);
          return of(null);
        })
      )
      .subscribe((res: any) => {
        //console.log('Response:', res);
        if (res.data) {

          for (let i = 0; i < res.data.length; i++) {
            const element = res.data[i];
            //console.log('element==>', element.thumbnail);
            if (element?.thumbnail != null) {
              //console.log('environment.API_URL==>', environment.API_URL);
              element.thumbnail = environment.DOMAIN + '/' + element.thumbnail;
            }
            this.categoryListData.push(element);
          }
        }
        //console.log('categoryListData==>', this.categoryListData);

        this.cd.detectChanges();
        // this.categoryListData = res.data;
      });
  }
openDialog(id: any): void {
  let popupData = {
    title: 'Category',
    description: 'Are you sure, you want to delete category',
    id: id
  }
  const modalRef = this.ngbModal.open(ConfirmationPopupComponent, {
    size: 'sm',
    centered: true
  });
  modalRef.componentInstance.data = popupData;
  modalRef.result.then((result) => {
    if (result && result.action === 'delete') {
      this.deleteCategory(result.id);
    }
  }).catch(() => {});
}

openCategoryPreview(item: any): void {
  if (!this.categoryPreviewModal) return;
  this.selectedCategory = item;
  this.previewDialogRef = this.ngbModal.open(this.categoryPreviewModal, {
    size: 'lg',
    centered: true,
    scrollable: true
  });
}

  closeCategoryPreview(): void {
    this.previewDialogRef?.close();
    this.previewDialogRef = undefined;
  }

  editCategory(item:any){
    this.imagePreview = '';
     this.isEdit = true;
    this.updateCategoryId = item.id;
    const thumbControl = this.addCategory.get('categoryThumbnail');
    thumbControl?.clearValidators();
    thumbControl?.updateValueAndValidity();
    this.imagePreview = item.thumbnail; 
    this.imageFile = null;
    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
  // this.addCategory.patchValue(item);
   this.addCategory.patchValue({
      name: item?.name ?? '',
      categoryThumbnail: null,
      customCategoryIcon: item?.customCategoryIcon ?? '',
      description: item?.description ?? '',
      is_menu: !!Number(item?.is_menu),
      allow_on: item?.allow_on ?? ''
    });
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
     this.dataService.update('categories', formData,this.updateCategoryId)
      .pipe(
        catchError(err => {
          console.error('Error:', err);
           setTimeout(() => {
          this.globalService.showToast(err);
        }, 100);
          return of(err);
        })
      )
      .subscribe((res: any) => {
        console.log('Response:', res);
         this.addCategory.reset();
         this.isEdit = false;
         this.imagePreview = '';
        if (res.error) {
          this.globalService.showToast(res.err);
          
        }

else{
  
        this.getCategoryList();
        setTimeout(() => {
          this.globalService.showToast(res);
        }, 100);
        this.cd.detectChanges();
}


        // this.categoryListData = res.data;
      });
  }
  deleteCategory(id: any) {
    this.dataService.delete(`categories/${id}`)
      .pipe(
        catchError(err => {
          console.error('Error:', err);
           setTimeout(() => {
          this.globalService.showToast(err);
        }, 100);
          return of(null);
        })
      )
      .subscribe((res: any) => {
        //console.log('Response:', res);
        this.getCategoryList();
          setTimeout(() => {
          this.globalService.showToast(res);
        }, 100);
        this.cd.detectChanges();
        // this.categoryListData = res.data;
      });
  }
  // clearForm(){
  //   this.addCategory.reset();
  // if (this.fileInput) {
  //   this.fileInput.nativeElement.value = '';
  //   this.imagePreview = '';
  // }
  //   this.isEdit = false;
  // }
    clearForm(){
    this.addCategory.reset();
  this.addCategory.get('categoryThumbnail')?.setValidators([Validators.required]);
  this.addCategory.get('categoryThumbnail')?.updateValueAndValidity();
  if (this.fileInput) {
    this.fileInput.nativeElement.value = '';
    this.imagePreview = '';
  }
    this.imageFile = null;
    this.isEdit = false;
  }
  get f() {
  return this.addCategory.controls;
}
}
