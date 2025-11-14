import { Component } from '@angular/core';
import {Sidebar} from "../../../layout/sidebar/sidebar";
import {Header} from "../../../layout/header/header";
import { FormArray, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { QuillModule } from 'ngx-quill';


@Component({
  selector: 'app-add-customer',
  imports: [
    Sidebar,
     Header,
     ReactiveFormsModule,
     QuillModule,
    ],
  templateUrl: './add-product.html',
  styleUrl: './add-product.scss'
})
export class AddProduct {
  productDetails!:FormGroup;
  inventoryForm!: FormGroup;
  priceForm!: FormGroup;
  shippingInfoForm!: FormGroup;
  videoForm!: FormGroup;
  shippingConfigForm!: FormGroup;
  offerForm!: FormGroup;
  seoForm!: FormGroup;
  categoryForm!: FormGroup;
  publishForm!: FormGroup;
  productOptionData!: FormGroup;
  productMultipleOptionForm!: FormGroup;
    tagsForm!: FormGroup;
  commonTags = ['mobile', 'tab', 'watch', 't-shirt', 'shirt', 'book', 'monitor', 'cloth'];
categories = [
    {
      id: 'catFinance',
      name: 'Finance',
      subCategories: [
        { id: 'catBanking', name: 'Banking' },
        {
          id: 'catAccounting',
          name: 'Accounting',
          subCategories: [{ id: 'catBangladeshBank', name: 'BangladeshBank' }]
        }
      ]
    },
    {
      id: 'catFashion',
      name: 'Fashion & Clothing',
      subCategories: [
        { id: 'catTShirt', name: 't-Shirt' },
        {
          id: 'catShirt',
          name: 'Shirt',
          subCategories: [{ id: 'catCasualShirt', name: 'Casual Shirt' }]
        }
      ]
    },
    { id: 'catBag', name: 'Bag' },
    { id: 'catMonitor', name: 'Monitor' },
    { id: 'catKeyboard', name: 'Keyboard' },
    { id: 'catMouse', name: 'Mouse' }
  ];
  constructor(private fb: FormBuilder){
    this.initializeForms()
    this.initializeCategoryControls();
  }

  ngOnInit(){
  }
  initializeForms(){
    this.addProductDetails();
    this.productOptionType();
    this.submitProductMultipleOptionForm();
    this.addCategoriesForm();
    this.addTagsForm();
    // this.addInverntoryForm();
  }

  addProductDetails(){
    this.productDetails = this.fb.group({
      productTitle:[''],
      productDescription:[''],
    })
  }
  productOptionType(){
    this.productOptionData = this.fb.group({
      generalProductData:[false],
      downloadableProductData:[false]
    })
  }


submitProductMultipleOptionForm(){
  this.productMultipleOptionForm = this.fb.group({
      // Media Tab
      thumbUpload: ['', Validators.required],
      galleryUpload: [''],
      
      // Inventory Tab
      sku: ['', Validators.required],
      manageStock: [false],
      stockStatus: [],
      soldIndividually: [false],
      productCode: [''],
      lowStockWarning: [0],
      showStockQuantity: [false],
      showStockWithText: [false],
      hideStock: [false],
      
      // Price Tab
      regularPrice: [0, [Validators.required, Validators.min(0)]],
      salePrice: [0, Validators.min(0)],
      discountType: ['1'],
      priceDateStart: [''],
      priceDateEnd: [''],


      //attribute


      
      // Shipping Info Tab
      weight: [0, Validators.min(0)],
      length: [0, Validators.min(0)],
      width: [0, Validators.min(0)],
      height: [0, Validators.min(0)],
      shippingClass: ['0'],

      // Shipping COnfiguration
      estimateShippingTime: [''],
      freeShipping: [false],
      flatRate: [false],
      quantityMulitiply: [false],
      cashOnDelivery: [false],

      // offer 
      flashDeal: [false],
      todaysDeal: [false],
      featured: [false],

// SEO Data
      focusKeyphrase: ['', Validators.required],
      metaTitle: ['', [Validators.required, Validators.maxLength(60)]],
      slugText: ['', [Validators.required, Validators.pattern('^[a-z0-9-]+$')]],
      metaDscr: ['', [Validators.required, Validators.maxLength(160)]],

      // Published Panel
      status: ['0', Validators.required],
      visibility: ['0', Validators.required],
      publishDate: ['', Validators.required],

      // Category Panel
     categorySearch: [''],
      newCategoryName: ['', Validators.required],
      newCategoryParent: ['']

    });
}

addCategoriesForm(){
 this.categoryForm = this.fb.group({
      search: [''],
      selectedCategories: this.fb.array([]),
      newCategory: this.fb.group({
        name: [''],
        parent: ['']
      })
    });
}

addTagsForm(){
   this.tagsForm = this.fb.group({
      tagInput: [''],
      tags: [[]]
    });
}
private initializeCategoryControls(): void {
    const selectedCategories = this.categoryForm.get('selectedCategories') as FormArray;
    selectedCategories.clear();

    this.categories.forEach(category => {
      selectedCategories.push(new FormControl(false));
      if (category.subCategories) {
        category.subCategories.forEach(sub => {
          selectedCategories.push(new FormControl(false));
          if (sub.subCategories) {
            sub.subCategories.forEach(() => {
              selectedCategories.push(new FormControl(false));
            });
          }
        });
      }
    });
  }

  get selectedCategories(): FormArray {
    return this.categoryForm.get('selectedCategories') as FormArray;
  }

  get newCategoryForm(): FormGroup {
    return this.categoryForm.get('newCategory') as FormGroup;
  }


  onSearch(): void {
    console.log('Search Query:', this.categoryForm.get('search')?.value);
    // Add search logic here
  }
   getCategoryLabel(index: number): string {
    // Simplified way to show category name from index
    const flatList: string[] = [];
    this.categories.forEach(c => {
      flatList.push(c.name);
      c.subCategories?.forEach(sub => {
        flatList.push('— ' + sub.name);
        sub.subCategories?.forEach(subSub => flatList.push('—— ' + subSub.name));
      });
    });
    return flatList[index] || 'Category ' + index;
  }
  addNewCategory(): void {
    const newCat = this.newCategoryForm.value;
    console.log('New Category:', newCat);
  }


  // Tags start 

 addTag() {
  console.log('this.tagsForm.value==>',this.tagsForm.value);
  
    const tagValue = this.tagsForm.value.tagInput?.trim();
    console.log('tagValue ==>', tagValue);

    if (tagValue) {
      const currentTags = this.tagsForm.value.tags || [];
      const newTags = [
        ...currentTags,
        ...tagValue.split(',').map((t: any) => t.trim()).filter(Boolean)
      ];
      this.tagsForm.patchValue({ tags: newTags, tagInput: '' });
    }
  }

  // ✅ Remove tag by index
  removeTag(index: number) {
    const currentTags = [...this.tagsForm.value.tags];
    currentTags.splice(index, 1);
    this.tagsForm.patchValue({ tags: currentTags });
  }

  // ✅ Select from most used tags
  selectTag(tag: string) {
    const currentTags = this.tagsForm.value.tags || [];
    if (!currentTags.includes(tag)) {
      this.tagsForm.patchValue({ tags: [...currentTags, tag] });
    }
  }

getProductDetails(){
  console.log('productDetails==>',this.productDetails.value);
  console.log('productOptionData==>',this.productOptionData.value);
console.log('submitProductMultipleOptionForm==>',this.productMultipleOptionForm.value);
// console.log('New Category:', this.categoryForm.get('newCategory')?.value);
console.log('New Category:', this.newCategoryForm.value);
console.log('this.tagsForm==>',this.tagsForm.value.tags);
console.log('selectedCategories==>',this.selectedCategories.value);

// tagsform value 
const tagsArray = this.tagsForm.value.tags;
const tagsString = tagsArray.join(', ');
console.log('tagsString',tagsString);


  
  
}


 
}
