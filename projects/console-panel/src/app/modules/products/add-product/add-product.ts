import { ChangeDetectorRef, Component, ElementRef, inject, Optional, Output, ViewChild } from '@angular/core';
import { Sidebar } from '../../../layout/sidebar/sidebar';
import { Header } from '../../../layout/header/header';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

import { DataService } from 'shared-lib';
import { catchError, of } from 'rxjs';
import { GlobalService } from '../../../global.service';
import { MatTreeModule } from '@angular/material/tree';
import { environment } from 'environments/environment';
import { MatIconModule } from '@angular/material/icon';
import { SharedModule } from '../../../shared.module';
import { CategoryTreeComponent } from './category-tree/category-tree.component';
import { PRODUCT_TYPE } from 'shared-lib/constants/app-constant';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { QuillModule } from 'ngx-quill';
import Quill from 'quill';
import { ImageHandler, Options } from 'ngx-quill-upload';
Quill.register('modules/imageHandler', ImageHandler);

interface FoodNode {
  name: string;
  children?: FoodNode[];
}
@Component({
  selector: 'app-add-customer',
  imports: [ReactiveFormsModule, QuillModule, MatTreeModule, MatIconModule, CategoryTreeComponent],
  templateUrl: './add-product.html',
  styleUrl: './add-product.scss',
})
export class AddProduct {
  childrenAccessor = (node: FoodNode) => node.children ?? [];
  @ViewChild('galleryInput') galleryInput!: ElementRef<HTMLInputElement>;
  @ViewChild('descriptionImageGallery') descriptionImageGallery!: ElementRef<HTMLInputElement>;
  @Output() data: any = {
    price_data: {},
    shipping_info: {},
    shipping_config: {},
    offer: {},

  };

  modulesNoImage = {
    toolbar: [
      // --- TEXT STYLE ---
      [{ 'font': [] }, { 'size': ['small', false, 'large', 'huge'] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'script': 'sub' }, { 'script': 'super' }],

      // --- HEADER & QUOTES ---
      [{ 'header': 1 }, { 'header': 2 }, 'blockquote', 'code-block'],

      // --- LISTS & INDENTS ---
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      [{ 'indent': '-1' }, { 'indent': '+1' }],
      [{ 'direction': 'rtl' }],

      // --- ALIGNMENT ---
      [{ 'align': [] }],

      // --- LINKS & MEDIA ---
      ['link', 'formula'],

      // --- UTILS ---
      ['clean']
    ],
   



  };



  modulesWithImage = {
    toolbar: [
      // --- TEXT STYLE ---
      [{ 'font': [] }, { 'size': ['small', false, 'large', 'huge'] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'script': 'sub' }, { 'script': 'super' }],

      // --- HEADER & QUOTES ---
      [{ 'header': 1 }, { 'header': 2 }, 'blockquote', 'code-block'],

      // --- LISTS & INDENTS ---
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      [{ 'indent': '-1' }, { 'indent': '+1' }],
      [{ 'direction': 'rtl' }],

      // --- ALIGNMENT ---
      [{ 'align': [] }],

      // --- LINKS & MEDIA ---
      ['link', 'image', 'formula'],

      // --- UTILS ---
      ['clean']
    ],
    imageHandler: {
      upload: (file: File) => {

        return new Promise((resolve, reject) => {

          // 1. Validation Logic
          if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
            console.info('Unsupported type');
            return reject('Unsupported type');
          }
          if (file.size > 1000000) {
            console.info('Size');
            return reject('Size too large (Max 1MB)');
          }

          // 2. Call the Service
          const formData = new FormData();
          formData.append('files', file);
          formData.append('type', 'product_image_description');

          this.dataService
            .postForm('gallery', formData)
            .pipe(
              catchError((err) => {
                return of(null);
              })
            )
            .subscribe((res: any) => {
              console.log('Response:', res);
              resolve(res.data[0].url);

            });

        });
      },
      accepts: ['png', 'jpg', 'jpeg', 'jfif']
    } as Options,




  };


  dataSource = [];

  hasChild = (_: number, node: FoodNode) => !!node.children && node.children.length > 0;
  productDetails!: FormGroup;
  inventoryForm!: FormGroup;
  // priceForm!: FormGroup;
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
          subCategories: [{ id: 'catBangladeshBank', name: 'BangladeshBank' }],
        },
      ],
    },
    {
      id: 'catFashion',
      name: 'Fashion & Clothing',
      subCategories: [
        { id: 'catTShirt', name: 't-Shirt' },
        {
          id: 'catShirt',
          name: 'Shirt',
          subCategories: [{ id: 'catCasualShirt', name: 'Casual Shirt' }],
        },
      ],
    },
    { id: 'catBag', name: 'Bag' },
    { id: 'catMonitor', name: 'Monitor' },
    { id: 'catKeyboard', name: 'Keyboard' },
    { id: 'catMouse', name: 'Mouse' },
  ];
  productMediaSection!: FormGroup;
  thumbFile: any;
  galleryFiles: any;
  thumbPreview: any = [];
  productInventrySection!: FormGroup;
  priceSection!: FormGroup;
  shippingInfoSection!: FormGroup;
  productAttributesForm!: FormGroup;
  public dataService: any = inject(DataService);
  categoryListData: any = {
    isSelectedCategory: {},
    categories: []
  };
  parentId!: Number;
  selectedThumbImg: any;
  thumbGallery: any = [];
  permaLink: any;
  isInputShow: boolean = false;
  domain: string = '';
  productStatus: any = [];
  wrongDiscount: boolean = false;
  selectProductDesciptionImageGallery: File[] = [];
  prodDescriptionImageGallery: any = [];
  selectedFile: File[] = [];
  statusMap: any = [];
  isUpdateproduct: boolean = false;
  finalpriceObj: any;
  constructor(
    private fb: FormBuilder,
    private globalService: GlobalService,
    private cd: ChangeDetectorRef,
    @Optional() public activeModal: NgbActiveModal
  ) {
    this.productStatus = PRODUCT_TYPE;

  }

  onGetId(id: number) {
    this.parentId = id;
  }
  ngOnInit() {

    this.domain = window.location.origin;
    this.getCategoryList();
    this.initializeForms();
    // this.initializeCategoryControls();

  }
  isNotEmpty(obj: any): boolean {
    return obj && Object.keys(obj).length > 0;
  }
  initializeForms() {
    // console.log('data',this.data);
    // console.log('this.data.category.length ===>',this.data.images );
    console.log('log==>', this.data);
    //    Object.keys(this.data.flags || {}).length ||
    // Object.keys(this.data.images || {}).length ||
    const hasValidData =
      Object.keys(this.data?.product_details || {}).length;
    if (this.data && hasValidData) {
      console.log('log==> enrer', this.data);
      this.isUpdateproduct = true;
      if (this.data?.flags) {
        console.log('this.data.category.length ===>', this.data.flags);

        this.productStatus = this.data.flags;
      }
      if (this.data?.images) {
        this.thumbGallery = this.data?.images
          ?.filter((img: any) => img.type === 'gallery')
          .map((img: any) => img.url);

        this.thumbPreview = this.data?.images
          ?.filter((img: any) => img.type === "thumbnail")
          .map((img: any) => img.url);
        console.log('thumbPreview===>', this.thumbGallery);

        // this.thumbPreview =  environment.DOMAIN + '/' + this.data?.thumbnail;
        // console.log('thumbPreview==>',this.thumbPreview);

        // this.cd.detectChanges();
      }
      if (this.data?.category) {
        console.log(' this.data?.category==>', Array.isArray(this.data?.category));

        // category exists and is NOT blank
        // this.getCategoryList();
        this.addProductDetails();
        this.productOptionType();
        this.submitProductMultipleOptionForm();
        // this.addCategoriesForm();
        this.addTagsForm();
        this.mediaForm();
        this.inventryForm();
        this.priceForm();
        this.shippingForm();
        this.productAttributeForm();
        this.shippingConfigForms();
        this.offerFormGroup();
        this.seoFormGroup();
      }
    }
    else {
      this.addProductDetails();
      this.productOptionType();
      this.submitProductMultipleOptionForm();
      // this.addCategoriesForm();
      this.addTagsForm();
      this.mediaForm();
      this.inventryForm();
      this.priceForm();
      this.shippingForm();
      this.productAttributeForm();
      this.shippingConfigForms();
      this.offerFormGroup();
      this.seoFormGroup();
    }
    // this.addInverntoryForm();
  }
  closeModal() {
    this.activeModal.close();
    this.isUpdateproduct = true;

  }
  addProductDetails() {
    this.productDetails = this.fb.group({
      productTitle: [this.data?.title, Validators.required], //product_title
      shortDescription: [this.data?.product_details?.shortDescription], //short_description
      productDescription: [this.data?.product_details?.productDescription], //description
      features: [this.data?.product_details?.features], //features
      // productStatus: [this.data.attributes?.productDetailsObj?.productStatus],
      productDescriptionImageGallery: [this.data?.product_details?.productDescriptionImageGallery]
    });
  }
  get addProductDetailsValidation() {
    return this.productDetails?.controls;
  }

  //   getStatusKeys(): string[] {
  //   return Object.keys(this.productStatus);
  // }

  onStatusChange(index: any, event: any) {
    this.productStatus[index].isActive = event.target.checked;

    console.log('Updated productStatus =>', this.productStatus);
  }


  // if (event.target.checked) {
  //   this.productStatusArray.push(new FormControl(value));
  // } else {
  //   const index = this.productStatusArray.controls
  //     .findIndex(x => x.value === value);

  //   this.productStatusArray.removeAt(index);
  // }
  productOptionType() {
    this.productOptionData = this.fb.group({
      generalProductData: [false],
      downloadableProductData: [false],
    });
  }

  // onStatusChange(event: any) {
  //   const selectedOptions = Array.from(event.target.selectedOptions).map(
  //     (option: any) => option.value
  //   );

  //   this.productDetails.patchValue({
  //     productStatus: selectedOptions,
  //   });
  // }

  mediaForm() {
    this.productMediaSection = this.fb.group({
      thumbUpload: ['', Validators.required],
      galleryUpload: []
    });
  }

  inventryForm() {
    this.productInventrySection = this.fb.group({
      sku: [this.data?.sku, Validators.required],
      manageStock: [this.data?.inventory?.manageStock],
      stockStatus: [this.data?.inventory?.stockStatus],
      soldIndividually: [this.data?.inventory?.soldIndividually],
      productCode: [this.data?.inventory?.productCode],
      lowStockWarning: [this.data?.inventory?.lowStockWarning],
      showStockQuantity: [this.data?.inventory?.showStockQuantity],
      showStockWithText: [this.data?.inventory?.showStockWithText],
      hideStock: [this.data?.inventory?.hideStock],
    });
  }

  priceForm() {
    this.priceSection = this.fb.group({
      regularPrice: [this.data?.price_data?.regularPrice, [Validators.required, Validators.min(1)]],
      salePrice: [this.data?.price_data?.salePrice, [Validators.min(0)]],
      gstPercent: [this.data?.price_data?.gstPercent],
      discountType: ['Flat'],
      priceDateStart: [''],
      priceDateEnd: [''],
    });

    // Subscribe to discount type changes to update validators
    this.priceSection.get('discountType')?.valueChanges.subscribe(type => {
      this.updateDiscountValidators(type);
    });
  }
  getGstDiscount() {
    this.finalpriceObj = this.priceSection.value;
    this.finalpriceObj.lastUpdatedDate = new Date().getTime();
    let finalPayload: any = {};
    // console.log('priceObj==>',finalpriceObj);

    if (this.finalpriceObj.regularPrice >= this.finalpriceObj.salePrice) {
      finalPayload.salePrice = this.finalpriceObj.salePrice;
    }
    else {
      finalPayload.salePrice = this.finalpriceObj.regularPrice;
    }
    finalPayload.quantity = 1;
    finalPayload.gstPercent = this.priceSection.value.gstPercent;

    // let payLoad = 
    this.dataService
      .postCommonApi(finalPayload, 'calculate-prices')
      .pipe(
        catchError((err) => {
          console.error('Error:', err);
          setTimeout(() => {
            // this.globalService.showMsgSnackBar(err);
          }, 100);
          return of(err);
        })
      )
      .subscribe((res: any) => {
        console.log('res==>', res);
        if (res.success) {
          this.finalpriceObj.caclulatedObj = res.data;
          this.cd.detectChanges();
        }
      })
  }
  shippingForm() {
    this.shippingInfoSection = this.fb.group({
      weight: [this.data?.shipping_info?.weight, Validators.min(0)],
      length: [this.data?.shipping_info?.length, Validators.min(0)],
      width: [this.data?.shipping_info?.width, Validators.min(0)],
      height: [this.data?.shipping_info?.height, Validators.min(0)],
      shippingClass: ['0'],
    });
  }
  productAttributeForm() {
    this.productAttributesForm = this.fb.group({
      selectedAttribute: [''],
      attributes: this.fb.array([]),
    });
  }
  get attributes(): FormArray {
    return this.productAttributesForm.get('attributes') as FormArray;
  }
  addAttribute() {
    const attr = this.fb.group({
      name: [''], // attribute name
      value: [''], // attribute value
    });

    this.attributes.push(attr);
    //console.log('this.attributes==>', this.attributes);
  }

  shippingConfigForms() {
    this.shippingConfigForm = this.fb.group({
      estimateShippingTime: [this.data?.shipping_config?.estimateShippingTime],
      freeShipping: [this.data?.shipping_config?.freeShipping],
      flatRate: [this.data?.shipping_config?.flatRate],
      quantityMulitiply: [this.data?.shipping_config?.quantityMulitiply],
      cashOnDelivery: [this.data?.shipping_config?.cashOnDelivery],
    });
  }

  offerFormGroup() {
    this.offerForm = this.fb.group({
      flashDeal: [this.data?.offer?.flashDeal],
      todaysDeal: [this.data?.offer?.todaysDeal],
      featured: [this.data?.offer?.featured],
    });
  }
  seoFormGroup() {
    this.seoForm = this.fb.group({
      focusKeyphrase: [this.data?.seo?.focusKeyphrase, Validators.required],
      metaTitle: [this.data?.seo?.metaTitle, [Validators.required, Validators.maxLength(60)]],
      slugText: [this.data?.seo?.slugText, [Validators.required, Validators.pattern('^[a-z0-9-]+$')]],
      metaDscr: [this.data?.seo?.metaDscr, [Validators.required, Validators.maxLength(160)]],
    });
  }

  submitProductMultipleOptionForm() {
    this.productMultipleOptionForm = this.fb.group({
      // Media Tab
      // thumbUpload: ['', Validators.required],
      // galleryUpload: [''],

      // Inventory Tab
      // sku: ['', Validators.required],
      // manageStock: [false],
      // stockStatus: [],
      // soldIndividually: [false],
      // productCode: [''],
      // lowStockWarning: [0],
      // showStockQuantity: [false],
      // showStockWithText: [false],
      // hideStock: [false],

      // Price Tab
      // regularPrice: [0, [Validators.required, Validators.min(0)]],
      // salePrice: [0, Validators.min(0)],
      // discountType: ['1'],
      // priceDateStart: [''],
      // priceDateEnd: [''],

      //attribute

      // Shipping Info Tab
      // weight: [0, Validators.min(0)],
      // length: [0, Validators.min(0)],
      // width: [0, Validators.min(0)],
      // height: [0, Validators.min(0)],
      // shippingClass: ['0'],

      // Shipping COnfiguration
      // estimateShippingTime: [''],
      // freeShipping: [false],
      // flatRate: [false],
      // quantityMulitiply: [false],
      // cashOnDelivery: [false],

      // offer
      // flashDeal: [false],
      // todaysDeal: [false],
      // featured: [false],

      // SEO Data
      // focusKeyphrase: ['', Validators.required],
      // metaTitle: ['', [Validators.required, Validators.maxLength(60)]],
      // slugText: ['', [Validators.required, Validators.pattern('^[a-z0-9-]+$')]],
      // metaDscr: ['', [Validators.required, Validators.maxLength(160)]],

      // Published Panel
      status: ['1', Validators.required],
      visibility: ['1', Validators.required],
      publishDate: ['', Validators.required],

      // Category Panel
      // categorySearch: [''],
      // newCategoryName: ['', Validators.required],
      // newCategoryParent: ['']
    });
  }

  // addCategoriesForm() {
  //   this.categoryForm = this.fb.group({
  //     search: [''],
  //     selectedCategories: this.fb.array([]),
  //     newCategory: this.fb.group({
  //       name: [''],
  //       parent: [''],
  //     }),
  //   });
  // }

  addTagsForm() {
    this.tagsForm = this.fb.group({
      tagInput: [''],
      tags: [this.data?.tags?.tags],
    });
  }
  // private initializeCategoryControls(): void {
  //   const selectedCategories = this.categoryForm.get('selectedCategories') as FormArray;
  //   selectedCategories.clear();

  //   this.categories.forEach((category) => {
  //     selectedCategories.push(new FormControl(false));
  //     if (category.subCategories) {
  //       category.subCategories.forEach((sub) => {
  //         selectedCategories.push(new FormControl(false));
  //         if (sub.subCategories) {
  //           sub.subCategories.forEach(() => {
  //             selectedCategories.push(new FormControl(false));
  //           });
  //         }
  //       });
  //     }
  //   });
  // }

  // get selectedCategories(): FormArray {
  //   return this.categoryForm.get('selectedCategories') as FormArray;
  // }

  get newCategoryForm(): FormGroup {
    return this.categoryForm.get('newCategory') as FormGroup;
  }

  onSearch(): void {
    //console.log('Search Query:', this.categoryForm.get('search')?.value);
    // Add search logic here
  }
  getCategoryLabel(index: number): string {
    // Simplified way to show category name from index
    const flatList: string[] = [];
    this.categories.forEach((c) => {
      flatList.push(c.name);
      c.subCategories?.forEach((sub) => {
        flatList.push('— ' + sub.name);
        sub.subCategories?.forEach((subSub) => flatList.push('—— ' + subSub.name));
      });
    });
    return flatList[index] || 'Category ' + index;
  }
  addNewCategory(): void {
    const newCat = this.newCategoryForm.value;
    //console.log('New Category:', newCat);
  }

  // Tags start

  addTag() {
    //console.log('this.tagsForm.value==>', this.tagsForm.value);

    const tagValue = this.tagsForm.value.tagInput?.trim();
    //console.log('tagValue ==>', tagValue);

    if (tagValue) {
      const currentTags = this.tagsForm.value.tags || [];
      const newTags = [
        ...currentTags,
        ...tagValue
          .split(',')
          .map((t: any) => t.trim())
          .filter(Boolean),
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
  onThumbSelect(event: any) {
    const file = event.target.files[0];
    this.thumbFile = file;

    // Create image preview
    const reader = new FileReader();
    reader.onload = () => {
      this.thumbPreview.push(reader.result as string);
    };
    reader.readAsDataURL(file);
  }

  // media upload photo fnc
  onFileSelect(event: any) {
    // const file = event.target.files[0];
    for (let i = 0; i < event.target.files.length; i++) {
      const file = event.target.files[i];
      if (!file) return;
      this.selectedFile.push(file);
      //console.log('this.selectedFile===>', this.selectedFile);

      // Preview if needed
      const reader = new FileReader();
      reader.onload = () => {
        // this.thumbPreview = reader.result as string;
        this.thumbGallery.push(reader.result as string);
        this.cd.detectChanges();
      };

      const element = this.selectedFile[i];
      reader.readAsDataURL(element);
    }
    // Call upload immediately
    // this.uploadImage();
    //console.log(' this.thumbGallery===>', this.thumbGallery);
  }
  onFileProductDescriptionGallery(event: any) {
    // const file = event.target.files[0];
    for (let i = 0; i < event.target.files.length; i++) {
      const file = event.target.files[i];
      if (!file) return;
      this.selectProductDesciptionImageGallery.push(file);
      //console.log('this.selectedFile===>', this.selectedFile);

      // Preview if needed
      const reader = new FileReader();
      reader.onload = () => {
        // this.thumbPreview = reader.result as string;
        this.prodDescriptionImageGallery.push(reader.result as string);
        this.cd.detectChanges();
      };

      const element = this.selectProductDesciptionImageGallery[i];
      reader.readAsDataURL(element);
      this.cd.detectChanges();

    }
    // Call upload immediately
    // this.uploadImage();
    //console.log(' this.thumbGallery===>', this.thumbGallery);
  }
  onFileSelectThumb(event: any) {
    const file = event.target.files[0];
    if (!file) return;
    // const file = event.target.files[0];
    // this.selectedFile.push(file);
    this.selectedThumbImg = file;

    // Preview if needed
    const reader = new FileReader();
    reader.onload = () => {
      // this.thumbPreview = reader.result as string;
      this.thumbPreview = reader.result as string;
      this.cd.detectChanges();
    };
    reader.readAsDataURL(file);
    // Call upload immediately
    // this.uploadImage();
  }
  uploadImage() {
    if (!this.selectedThumbImg) return;
    const formData = new FormData();
    // for (let i = 0; i < this.selectedFile.length; i++) {
    // const element = this.selectedFile[i];
    formData.append('files', this.selectedThumbImg, this.selectedThumbImg.name);
    formData.append('module', 'product');
    formData.append('module_id', 'gallery');
    formData.append('type', 'gallery');
    // }
    // Add other parameters if needed
  }

  onGallerySelect(event: any) {
    this.galleryFiles = event.target.files;
  }
  updateProduct() {
    console.log('this.data?.id===>', this.data?.id);

    this.finalpriceObj = this.priceSection.value;
    this.finalpriceObj.lastUpdatedDate = new Date().getTime();

    // priceSection.priceDateStart = new Date(this.priceSection.value.priceDateStart).getTime();
    // priceSection.priceDateEnd = new Date(this.priceSection.value.priceDateEnd).getTime();
    let mediaSectionPayload = {
      thumbFile: this.thumbFile,
      galleryFiles: this.galleryFiles,
    };
    let finalData: any = {
      category_id: this.parentId,
      media: mediaSectionPayload,
      title: this.productDetails.value.productTitle,
      description: this.productDetails.value.productDescription,
      shortDescription: this.productDetails.value.shortDescription,
      features: this.productDetails.value.features,
      inventory: this.productInventrySection.value,
      price_data: this.finalpriceObj,
      shipping_info: this.shippingInfoSection.value,
      shipping_config: this.shippingConfigForm.value,
      offer: this.offerForm.value,
      seo: this.seoForm.value,
      tags: this.tagsForm.value,
      flags: this.productStatus,
      product_details: this.productDetails.value,
      visibility: {
        status: this.productMultipleOptionForm.value.status,
        publishDate: this.productMultipleOptionForm.value.publishDate,
        visibility: this.productMultipleOptionForm.value.visibility,
      },
      attributes: {
      }
    };
    let url = `products/${this.data?.id}`
    this.dataService
      .put(finalData, url)
      .pipe(
        catchError((err) => {
          console.error('Error:', err);
          setTimeout(() => {
            // this.globalService.showMsgSnackBar(err);
          }, 100);
          return of(err);
        })
      )
      .subscribe((res: any) => {
        //console.log('Response:', res);
        if (res.error) {
          this.globalService.showMsgSnackBar(res.error);
          return;
        } else if (res.success == true) {
          let id = res.data.data.id;
          //console.log('this.selectedThumbImg==>', this.selectedThumbImg);

          if (this.selectedThumbImg != undefined) {
            const formDataThumb = new FormData();
            // for (let i = 0; i < this.selectedFile.length; i++) {
            // const element = this.selectedFile[i];
            formDataThumb.append('files', this.selectedThumbImg, this.selectedThumbImg.name);
            formDataThumb.append('module', 'product');
            formDataThumb.append('module_id', id);
            formDataThumb.append('type', 'thumbnail');
            this.callUploadnediaSection(formDataThumb);
          }
          if (this.selectProductDesciptionImageGallery?.length) {
            for (const file of this.selectProductDesciptionImageGallery) {
              const formData = new FormData();
              formData.append('files', file);
              formData.append('module', 'product');
              formData.append('module_id', id);
              formData.append('type', 'photoDescriptionImageGallery');
              this.callUploadnediaSection(formData);
            }
          }
          if (this.selectedFile?.length) {
            for (const file of this.selectedFile) {
              const formData = new FormData();
              formData.append('files', file);
              formData.append('module', 'product');
              formData.append('module_id', id);
              formData.append('type', 'gallery');

              this.callUploadnediaSection(formData);
            }


            //   for (let i = 0; i < this.selectedFile.length; i++) {
            //   const element = this.selectedFile[i];

            //   const formData = new FormData();   // IMPORTANT: create new for each file

            //   formData.append("files", element, element.name);
            //   formData.append("module", "product");
            //   formData.append("module_id", id);
            //   formData.append("type", "gallery");
            // //console.log('formData==>',formData);

            //   this.callUploadnediaSection(formData);
            // }
          }
          setTimeout(() => {
            this.globalService.showMsgSnackBar(res);
            this.activeModal.close('success');
          }, 100);
        }
        // this.addCategory.reset();
        // this.imagePreview = '';
        // this.imageFile = null;
        // this.getCategoryList();
      });

  }
  getProductDetails() {
    //console.log('productDetails==>', this.productDetails.value);

    let priceSection = this.priceSection.value;
    // priceSection.priceDateStart = new Date(this.priceSection.value.priceDateStart).getTime();
    // priceSection.priceDateEnd = new Date(this.priceSection.value.priceDateEnd).getTime();
    // media payload
    let mediaSectionPayload = {
      thumbFile: this.thumbFile,
      galleryFiles: this.galleryFiles,
    };
    let finalData: any = {
      category_id: this.parentId,
      media: mediaSectionPayload,
      title: this.productDetails.value.productTitle,
      description: this.productDetails.value.productDescription,
      shortDescription: this.productDetails.value.shortDescription,
      features: this.productDetails.value.features,
      // productStatus:this.productDetails.value.productStatus,
      inventory: this.productInventrySection.value,
      price_data: this.finalpriceObj,
      shipping_info: this.shippingInfoSection.value,
      shipping_config: this.shippingConfigForm.value,
      offer: this.offerForm.value,
      seo: this.seoForm.value,
      tags: this.tagsForm.value,
      flags: this.productStatus,
      product_details: this.productDetails.value,
      // visibility:this.productMultipleOptionForm.value,
      visibility: {
        status: this.productMultipleOptionForm.value.status,
        publishDate: this.productMultipleOptionForm.value.publishDate,
        visibility: this.productMultipleOptionForm.value.visibility,
      },
      attributes: {
        // product_details: this.productDetails.value

        //      productDetailsObj : {
        //   productDetails :this.productDetails.value.productTitle,
        //   shortDescription:this.productDetails.value.shortDescription,
        //   productDescription: this.productDetails.value.description,
        //   features:this.productDetails.value.features,
        //   productStatus: [[]],
        // }
      }
    };
    console.log('finalData==>', finalData);
    this.dataService
      .post(finalData, 'products')
      .pipe(
        catchError((err) => {
          console.error('Error:', err);
          setTimeout(() => {
            // this.globalService.showMsgSnackBar(err);
          }, 100);
          return of(err);
        })
      )
      .subscribe((res: any) => {
        //console.log('Response:', res);
        if (res.error) {
          this.globalService.showMsgSnackBar(res.error);
          return;
        } else if (res.success == true) {
          // let id = res.data.id;
          let id = res.data.data.id;
          //console.log('this.selectedThumbImg==>', this.selectedThumbImg);

          if (this.selectedThumbImg != undefined) {
            const formDataThumb = new FormData();
            // for (let i = 0; i < this.selectedFile.length; i++) {
            // const element = this.selectedFile[i];
            formDataThumb.append('files', this.selectedThumbImg, this.selectedThumbImg.name);
            formDataThumb.append('module', 'product');
            formDataThumb.append('module_id', id);
            formDataThumb.append('type', 'thumbnail');
            this.callUploadnediaSection(formDataThumb);
          }
          if (this.selectProductDesciptionImageGallery?.length) {
            for (const file of this.selectProductDesciptionImageGallery) {
              const formData = new FormData();
              formData.append('files', file);
              formData.append('module', 'product');
              formData.append('module_id', id);
              formData.append('type', 'photoDescriptionImageGallery');
              this.callUploadnediaSection(formData);
            }
          }
          if (this.selectedFile?.length) {
            for (const file of this.selectedFile) {
              const formData = new FormData();
              formData.append('files', file);
              formData.append('module', 'product');
              formData.append('module_id', id);
              formData.append('type', 'gallery');

              this.callUploadnediaSection(formData);
            }


            //   for (let i = 0; i < this.selectedFile.length; i++) {
            //   const element = this.selectedFile[i];

            //   const formData = new FormData();   // IMPORTANT: create new for each file

            //   formData.append("files", element, element.name);
            //   formData.append("module", "product");
            //   formData.append("module_id", id);
            //   formData.append("type", "gallery");
            // //console.log('formData==>',formData);

            //   this.callUploadnediaSection(formData);
            // }
          }
          setTimeout(() => {
            this.globalService.showMsgSnackBar(res);
          }, 100);
        }
        // this.addCategory.reset();
        // this.imagePreview = '';
        // this.imageFile = null;
        // this.getCategoryList();
      });

    //   //console.log('thumbFile',this.thumbFile);  // FileList
    //   //console.log('galleryFiles',this.galleryFiles);  // FileList
    // //console.log('this.priceSection.value.priceDateStart==>',this.priceSection.value);
    // // price start and end time
    //   const priceDateStart = new Date(this.priceSection.value.priceDateStart).getTime();
    //   const priceDateEnd = new Date(this.priceSection.value.priceDateEnd).getTime();

    // media payload
    // let mediaSectionPayload = {
    // thumbFile:this.thumbFile,
    // galleryFiles:this.galleryFiles
    // }

    //   //console.log('productDetails==>',this.productDetails.value);
    //   //console.log('productOptionData==>',this.productOptionData.value);
    // //console.log('submitProductMultipleOptionForm==>',this.productMultipleOptionForm.value);
    // // //console.log('New Category:', this.categoryForm.get('newCategory')?.value);
    // //console.log('New Category:', this.newCategoryForm.value);
    // //console.log('this.tagsForm==>',this.tagsForm.value.tags);
    // //console.log('selectedCategories==>',this.selectedCategories.value);

    // tagsform value
    // const tagsArray = this.tagsForm.value.tags;
    // const tagsString = tagsArray.join(', ');
    // //console.log('tagsString',tagsString);
  }

  callUploadnediaSection(formData: any) {
    //console.log('formData==>', formData);

    this.dataService
      .postForm('media/upload', formData)
      .pipe(
        catchError((err) => {
          console.error('Error:', err);
          //     setTimeout(() => {
          //   this.globalService.showMsgSnackBar(err);
          // }, 100);
          return of(null);
        })
      )
      .subscribe((res: any) => {
        //console.log('Response:', res);
        // this.getCategoryList();
        // setTimeout(() => {
        //   this.globalService.showMsgSnackBar(res);
        // }, 100);
      });
  }

  // get categories
  getCategoryList() {
    this.categoryListData = {};
    this.dataService
      .get('categories')
      .pipe(
        catchError((err) => {
          console.error('Error:', err);
          return of(null);
        })
      )
      .subscribe((res: any) => {
        let filteredData = [];
        //console.log('Response:', res);
        if (res.data) {
          for (let i = 0; i < res.data.length; i++) {
            const element = res.data[i];
            //console.log('element==>', element.thumbnail);
            if (element?.thumbnail != null) {
              //console.log('environment.API_URL==>', environment.API_URL);
              element.thumbnail = environment.DOMAIN + '/' + element.thumbnail;
            }
            if (this.data) {

              if (element.id == this.data?.category?.id) {
                element.checked = true;
              }
              else {
                element.checked = false;

              }
            }
            filteredData.push(element);
          }
          this.categoryListData.categories = filteredData;
          // Assign categories
          // this.categoryListData.categories.forEach((cat: any) => {
          //   cat.checked = this.data.category.id == cat.id;
          // });

        }
        //console.log('categoryListData==>', this.categoryListData);
        // this.dataSource = this.categoryListData;
        this.cd.detectChanges();
        // this.categoryListData = res.data;
      });
  }

  createPermalink() {
    this.productDetails.value.productTitle;
    // let permaLinkValue = this.productDetails.value.productTitle.contains(' ')
    const formatted = this.productDetails.value.productTitle.replace(/\s+/g, '-').toLowerCase();
    this.permaLink = formatted;
    this.seoForm.patchValue({ slugText: formatted });
    this.cd.detectChanges();
  }
  enableInput() {
    this.isInputShow = true;
  }
  getUpdatedValue(event: any) {
    //console.log('event==>', event.target.value);
    let value = event.target.value.replace(/\s+/g, '-').toLowerCase();
    this.permaLink = value;
  }
  onPermalinkBlur(event: any) {
    const value = event.target.textContent.trim().replace(/\s+/g, '-').toLowerCase();
    this.permaLink = value;
    this.cd.detectChanges();
  }
  permalinkAction(action: String) {
    this.isInputShow = false;
    if (action == 'cancel') {
      // this.permaLink = '';
    }
  }
  discountPriceChange() {
    const regularPrice = this.priceSection.value.regularPrice;
    const salePrice = this.priceSection.value.salePrice;
    const discountType = this.priceSection.value.discountType;

    // Check if discount is greater than or equal to regular price (only for Flat discount)
    if (discountType === 'Flat' && regularPrice && salePrice && salePrice >= regularPrice) {
      this.wrongDiscount = true;
    } else {
      this.wrongDiscount = false;
    }
    setTimeout(() => {
      this.getGstDiscount();
    }, 1000);
  }
  onDiscountTypeChange() {
    const discountType = this.priceSection.value.discountType;
    this.updateDiscountValidators(discountType);
    this.discountPriceChange();
  }

  updateDiscountValidators(type: string) {
    const salePriceControl = this.priceSection.get('salePrice');

    if (type === 'Discount') {
      // For percentage, min 0 and max 100
      salePriceControl?.setValidators([Validators.min(0), Validators.max(100)]);
    } else {
      // For flat amount, just min 0
      salePriceControl?.setValidators([Validators.min(0)]);
    }

    salePriceControl?.updateValueAndValidity();

    this.cd.detectChanges();
  }


  removeGalleryImage(index: number) {
    // Remove from the preview array
    this.thumbGallery.splice(index, 1);

    // Remove from the selected files array
    if (this.selectedFile && this.selectedFile.length > index) {
      this.selectedFile.splice(index, 1);
    }

    // Update the file input with remaining files
    if (this.galleryInput) {
      if (this.selectedFile.length === 0) {
        // Clear input if no files remain
        this.galleryInput.nativeElement.value = '';
      } else {
        // Rebuild the FileList with remaining files
        const dataTransfer = new DataTransfer();
        this.selectedFile.forEach((file) => {
          dataTransfer.items.add(file);
        });
        this.galleryInput.nativeElement.files = dataTransfer.files;
      }
    }

    // Trigger change detection
    this.cd.detectChanges();
  }
  removeProductDescriptionGalleryImage(index: number) {
    // Remove from the preview array
    this.prodDescriptionImageGallery.splice(index, 1);

    // Remove from the selected files array
    if (this.selectProductDesciptionImageGallery && this.selectProductDesciptionImageGallery.length > index) {
      this.selectProductDesciptionImageGallery.splice(index, 1);
    }

    // Update the file input with remaining files
    if (this.descriptionImageGallery) {
      if (this.selectProductDesciptionImageGallery.length === 0) {
        // Clear input if no files remain
        this.descriptionImageGallery.nativeElement.value = '';
      } else {
        // Rebuild the FileList with remaining files
        const dataTransfer = new DataTransfer();
        this.selectProductDesciptionImageGallery.forEach((file) => {
          dataTransfer.items.add(file);
        });
        this.descriptionImageGallery.nativeElement.files = dataTransfer.files;
      }
    }

    // Trigger change detection
    this.cd.detectChanges();
  }
  //    uploadPrdouctDescriptionImageGallery(){
  //  if (this.selectedFile?.length) {
  //               for (const file of this.selectedFile) {
  //                 const formData = new FormData();
  //                 formData.append('files', file);
  //                 formData.append('module', 'product');
  //                 formData.append('module_id', id);
  //                 formData.append('type', 'gallery');

  //                 this.callUploadnediaSection(formData);
  //               }
  //             }
  //    }
}
