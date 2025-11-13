import { Component } from '@angular/core';
import {Sidebar} from "../../../layout/sidebar/sidebar";
import {Header} from "../../../layout/header/header";
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
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

 categories = [
    { id: 'catFinance', name: 'Finance', parentId: null, hasSubCategories: false },
    { id: 'catBanking', name: 'Banking', parentId: 'catFinance', hasSubCategories: false },
    { id: 'catAccounting', name: 'Accounting', parentId: 'catFinance', hasSubCategories: false },
    { id: 'catBangladeshBank', name: 'BangladeshBank', parentId: 'catAccounting', hasSubCategories: false },
    { id: 'catFashion', name: 'Fashion & Clothing', parentId: null, hasSubCategories: false },
    { id: 'catTShirt', name: 't-Shirt', parentId: 'catFashion', hasSubCategories: false },
    { id: 'catShirt', name: 'Shirt', parentId: 'catFashion', hasSubCategories: false },
    { id: 'catCasualShirt', name: 'Casual Shirt', parentId: 'catShirt', hasSubCategories: false },
    { id: 'catBag', name: 'Bag', parentId: null, hasSubCategories: false },
    { id: 'catMonitor', name: 'Monitor', parentId: null, hasSubCategories: false },
    { id: 'catKeyboard', name: 'Keyboard', parentId: null, hasSubCategories: false },
    { id: 'catMouse', name: 'Mouse', parentId: null, hasSubCategories: false }
  ];
  constructor(private fb: FormBuilder){
this.initializeForms()
  }

  initializeForms(){
    this.addProductDetails();
    this.productOptionType();
    this.submitProductMultipleOptionForm();
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
this.categories.forEach(category => {
      category.hasSubCategories = this.categories.some(cat => cat.parentId === category.id);
    });
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
      selectedCategories: this.fb.array(
        this.categories.map(() => this.fb.control(false)) // One control per category
      ),
      newCategoryName: ['', Validators.required],
      newCategoryParent: ['']

    });
}


getProductDetails(){
  console.log('productDetails==>',this.productDetails.value);
  console.log('productOptionData==>',this.productOptionData.value);
console.log('submitProductMultipleOptionForm==>',this.productMultipleOptionForm.value);

  
  
}



get selectedCategories(): FormArray {
    return this.productMultipleOptionForm.get('selectedCategories') as FormArray;
  }

  // Helper to add a new category dynamically
addNewCategory() {
    const newCategoryName = this.productMultipleOptionForm.get('newCategoryName')?.value;
    const newCategoryParent = this.productMultipleOptionForm.get('newCategoryParent')?.value || null;

    if (newCategoryName) {
      const newCategoryId = `cat${this.categories.length + 1}`;
      const newCategory = {
        id: newCategoryId,
        name: newCategoryName,
        parentId: newCategoryParent,
        hasSubCategories: false
      };
      this.categories.push(newCategory);

      // Update hasSubCategories for the parent category, if any
      if (newCategoryParent) {
        const parentCategory = this.categories.find(cat => cat.id === newCategoryParent);
        if (parentCategory) {
          parentCategory.hasSubCategories = true;
        }
      }

      // Add a new control to the selectedCategories FormArray
      this.selectedCategories.push(this.fb.control(false));

      // Reset the new category form fields
      this.productMultipleOptionForm.patchValue({
        newCategoryName: '',
        newCategoryParent: ''
      });
    }
  }

 
}
