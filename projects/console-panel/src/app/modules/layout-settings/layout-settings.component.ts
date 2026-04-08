import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  inject,
  OnInit,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { catchError, of } from 'rxjs';
import { DataService } from 'shared-lib';
import { CdkDrag, CdkDragDrop, CdkDropList, moveItemInArray } from '@angular/cdk/drag-drop';
import { GlobalService } from '../../global.service';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'layout-settings',
  templateUrl: './layout-settings.component.html',
  imports: [FormsModule, CommonModule, CdkDrag, CdkDropList, ReactiveFormsModule],
  styleUrls: ['./layout-settings.component.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LayoutSettingsComponent implements OnInit {
  private readonly ngbModal = inject(NgbModal);
  private modalRef?: NgbModalRef;
  @ViewChild('uploadPhotoModal') uploadPhotoModal!: TemplateRef<any>;
  settingsModel: any = {
    general: {
      logo: {
        desktop: {
          imgSrc: '',
          alt: '',
        },
        mobile: {
          imgSrc: '',
          alt: '',
        },
      },
      favico: {
        desktop: {
          imgSrc: '',
          alt: '',
        },
        mobile: {
          imgSrc: '',
          alt: '',
        },
      },
    },
    home_Banner_Slider: [
      {
        imgSrc: '',
        alt: '',
        url: '',
      },
      {
        imgSrc: '',
        alt: '',
        url: '',
      },
    ],
    home_Promo_Slider:[
 {
        imgSrc: '',
        alt: '',
        url: '',
      },
    ],
    home_Promo_Slider_bottom:[
 {
        imgSrc: '',
        alt: '',
        url: '',
      },
    ],
    home_Promo_Slider_testimonials: [
      {
        imgSrc: '',
        alt: '',
        url: '',
      },
    ],
    social: [
      {
        label: 'facebook',
        link: '',
      },
      {
        label: 'twitter',
        link: '',
      },
      {
        label: 'instagram',
        link: '',
      },
      {
        label: 'linkedin',
        link: '',
      },
      {
        label: 'youtube',
        link: '',
      },
      {
        label: 'pinterest',
        link: '',
      },
    ],
    contacts: {
      mobileNo: '',
      whatsappLink: '',
      email: '',
      address: '',
    },
    footer:[
        {colHeading: '',
      externalLinkValue : '',
      showExternalInput : false,
      pageList:[],
      items: [
        {
          label: '',
          link: '',
          isSelected: false,
        },
      ],
    }
    ]
  };
  seoForm!:FormGroup;
  loading = true;
  public dataService: any = inject(DataService);
  private globalService: any = inject(GlobalService);
  private fb: any = inject(FormBuilder);

  pageList: any;
  uploadedFile: any;
  desktopLogoData: any = [];
  selectedImageobj: any = [];
  uploadIsFrom: any;
  isSelectedImage: boolean = false;
  selectedImageIndex: any;
  constructor(private cdr: ChangeDetectorRef) {
    this.getImageApi();
    // this.getDefaultImage();
  }

  openUploadModal(from: any) {
    this.resetUploadState();
    this.uploadIsFrom = from;
    this.modalRef = this.ngbModal.open(this.uploadPhotoModal, {
      windowClass: 'mobile-modal',
      centered: true,
      scrollable: true,
      size: 'xl',
      backdrop: 'static',
      keyboard: false
    });
  }

  ngOnInit() {
    // this.dataService.loadSetting().subscribe((d: any) => {
    //   // this.settingsModel.set(d || {});
    // this.settingsModel=d;
    // // console.info(this.settingsModel)
    // this.cdr.detectChanges();

    //   this.loading=false
    // });
this.seoFormGroup();
    this.getGeneralSetting();
  }
  getGeneralSetting() {
    this.dataService
      .get('settings/general')
      .pipe(
        catchError((err) => {
          console.error('Error:', err);
          return of(null);
        })
      )
      .subscribe((res: any) => {
        //// console.log('Response:', res);
        if (res.success) {
          this.settingsModel = res?.data?.settings;
          //  this.uploadedFile = this.settingsModel.general.logo.desktop.imgSrc

          this.getPageList();
          this.cdr.detectChanges();
        }
      });
  }
  // getDefaultImage(){
  //     this.dataService.get('gallery/1/usage')
  //     .pipe(
  //       catchError(err => {
  //         console.error('Error:', err);
  //         return of(null);
  //       })
  //     )
  //     .subscribe((res: any) => {
  //       //// console.log('Response:', res);
  //       if (res.data) {
  //         this.desktopLogoData = res.data;
  //         // console.log('desktopLogoData',this.desktopLogoData);

  //         this.cdr.detectChanges();
  //       }
  //     })
  // }

  seoFormGroup(){
     this.seoForm = this.fb.group({
      keywords: [''],          // Focus Keyphrase
      metaTitle: ['', Validators.maxLength(60)],
      metaDescription: ['', Validators.maxLength(160)]
    });
  }
  getSelectedImage(image: any, index:any) {
    this.selectedImageIndex=index;
    // console.log('image==>', image);
    this.isSelectedImage = true;
    // console.log('this.uploadIsFrom', this.uploadIsFrom);
    this.uploadedFile = null;
    this.imagePreview = null;
    this.selectedImageobj = [{ ...image, isFrom: this.uploadIsFrom }];
  }
  getImageApi() {
    this.dataService
      .get('gallery')
      .pipe(
        catchError((err) => {
          console.error('Error:', err);
          return of(null);
        })
      )
      .subscribe((res: any) => {
        //// console.log('Response:', res);
        if (res.data) {
          this.desktopLogoData = res.data;
          // console.log('desktopLogoData', this.desktopLogoData);

          this.cdr.detectChanges();
        }
      });
  }
  getPageList() {
    this.dataService
      .get('pages/list')
      .pipe(
        catchError((err) => {
          console.error('Error:', err);
          return of(null);
        })
      )
      .subscribe((res: any) => {
        //// console.log('Response:', res);
        if (res.data) {
          this.pageList = res.data;
          // this.settingsModel.footer.map((item:any)=>{
          //   item.pageList= JSON.parse(JSON.stringify(this.pageList))

          //   item.pageList.map((page:any)=>{
          //   if(item.items.findIndex((innerItems:any)=>innerItems.link==page.slug)>-1){
          //     page.isSelected=true
          //   }
          //   else{
          //     page.isSelected=false

          //   }

          // })

          // })
          //  this.settingsModel.footer.forEach((item: any) => {
          this.settingsModel?.footer?.map((item: any) => {
            const pageList = JSON.parse(JSON.stringify(this.pageList));

            // Create a map for quick lookup of order
            const orderMap = new Map(
              item?.items?.map((inner: any, index: number) => [inner.link, index])
            );

            item.pageList = pageList?.map((page: any) => ({
                ...page,
                isSelected: orderMap.has(page.slug),
              }))
              .sort((a: any, b: any) => {
                const aIndex: any = orderMap.get(a.slug);
                const bIndex: any = orderMap.get(b.slug);

                // Both exist in item.items -> sort by that order
                if (aIndex !== undefined && bIndex !== undefined) {
                  return aIndex - bIndex;
                }

                // Only one exists -> selected first
                if (aIndex !== undefined) return -1;
                if (bIndex !== undefined) return 1;

                // Neither exists -> keep original order
                return 0;
              });
          });

          this.cdr.detectChanges();
        }
      });
  }

  drop(event: any, data: any) {
    moveItemInArray(data, event.previousIndex, event.currentIndex);
  }
  // Add new empty slide
  addSlide(type: string) {
    // console.log('this.settingsModel[type]==>', type);
    // console.log('type==>', type);
// console.log('this.settingsModel==>',this.settingsModel);
if (!this.settingsModel[type]) {
  this.settingsModel[type] = [];
}
    this.settingsModel[type]?.push({
      imgSrc: '',
      alt: '',
      url: '',
    });
  }

  // Delete slide by index
  deleteSlide(type: string, index: number) {
    if (this.settingsModel[type].length > 0) {
      this.settingsModel[type].splice(index, 1);
    }
  }
  addFooterColumn() {
    // this.settingsModel['footer'] = [];
    this.settingsModel?.footer?.push({
      colHeading: '',
      externalLinkValue : '',
      showExternalInput : false,
      pageList: JSON.parse(JSON.stringify(this.pageList)),
      items: [
        {
          label: '',
          link: '',
          isSelected: false,
        },
      ],
    });
  }
  deleteFooterColumn(index: number) {
    this.settingsModel.footer.splice(index, 1);
  }

  addFooterColumnData(data: any) {
    data.push({
      label: '',
      link: '',
    });
  }
  deleteFooterColumnData(data: any, index: number) {
    data.splice(index, 1);
  }
  saveSettings() {
    
    let settingData = JSON.parse(JSON.stringify(this.settingsModel));
    for (let i = 0; i < settingData?.footer?.length; i++) {
      let data = settingData?.footer[i]?.pageList.filter((item: any) => item.isSelected);
      settingData.footer[i].items = [];
      data?.map((item: any) => {
        settingData.footer[i].items.push({
          label: item.title,
          link: item.slug,
        });
      });
      // this.settingsModel.footer[i].items =

      // Delete the 'pageList' property
      delete settingData.footer[i].pageList;
    }

    let payload:any = {
      settings_name: 'general',
      settings: settingData,
    };
    payload.settings.seoData = this.seoForm.value
    // // console.info('this.settingsModel',this.settingsModel)
    // return
    this.dataService
      .post(payload, 'settings')
      .pipe(
        catchError((err) => {
          console.error('Error:', err);
          this.globalService.showToast(err);
          return of(null);
        })
      )
      .subscribe((res: any) => {
        //// console.log('Response:', res);
        if (res.success) {
          this.globalService.showToast(res);
          this.getGeneralSetting();
        }
      });
  }

  imagePreview: string | null = null;

  onImageChange(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    this.uploadedFile = file;
    // console.log('this.uploadedFile==>', this.uploadedFile);
    if (file) {
      this.isSelectedImage = false;
      this.selectedImageobj = [];
      this.selectedImageIndex = null;
    } else {
      this.uploadedFile = null;
    }
    this.cdr.detectChanges();
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      this.imagePreview = reader.result as string;
      this.cdr.detectChanges();
    };
    reader.readAsDataURL(file);
  }

  removeImage(event: MouseEvent) {
    event.stopPropagation();
    this.imagePreview = null;
    this.uploadedFile = null;
  }

  private resetUploadState() {
    this.selectedImageobj = [];
    this.selectedImageIndex = null;
    this.isSelectedImage = false;
    this.imagePreview = null;
    this.uploadedFile = null;
  }

  private touchSettingsForUi() {
    this.settingsModel = { ...this.settingsModel };
    this.cdr.markForCheck();
  }

  private setSliderImage(sliderList: any[], index: number, imageUrl: string) {
    if (!Array.isArray(sliderList) || Number.isNaN(index) || index < 0) {
      return;
    }

    if (sliderList[index]) {
      sliderList[index].imgSrc = imageUrl;
      return;
    }

    sliderList[index] = {
      imgSrc: imageUrl,
      alt: '',
      url: '',
    };
  }

  private applyUploadedImage(type: string, imageUrl: string) {
    if (!type || !imageUrl) return;

    if (type === 'desktop') {
      this.settingsModel.general.logo.desktop.imgSrc = imageUrl;
      return;
    }

    if (type === 'mobile') {
      this.settingsModel.general.logo.mobile.imgSrc = imageUrl;
      return;
    }

    if (type === 'fav_mobile') {
      this.settingsModel.general.favico.mobile.imgSrc = imageUrl;
      return;
    }

    if (type === 'fav_desktop') {
      this.settingsModel.general.favico.desktop.imgSrc = imageUrl;
      return;
    }

    if (type.startsWith('promoslidertestimonial')) {
      const index = Number(type.replace('promoslidertestimonial', ''));
      this.setSliderImage(this.settingsModel.home_Promo_Slider_testimonials, index, imageUrl);
      return;
    }

    if (type.startsWith('homebottombanner')) {
      const index = Number(type.replace('homebottombanner', ''));
      this.setSliderImage(this.settingsModel.home_Promo_Slider_bottom, index, imageUrl);
      return;
    }

    if (type.startsWith('promoslider')) {
      const index = Number(type.replace('promoslider', ''));
      this.setSliderImage(this.settingsModel.home_Promo_Slider, index, imageUrl);
      return;
    }

    if (type.startsWith('slider')) {
      const index = Number(type.replace('slider', ''));
      this.setSliderImage(this.settingsModel.home_Banner_Slider, index, imageUrl);
    }
  }
  async savedImage() {
    // console.log('uploadisFrom', this.uploadIsFrom);
    // console.log('this.selectedImageobj?.type==>', this.selectedImageobj);

    if (this.isSelectedImage && this.selectedImageobj.length > 0) {
      for (const element of this.selectedImageobj) {
        this.applyUploadedImage(element.isFrom, element.url);
      }
      this.touchSettingsForUi();
      this.cdr.detectChanges();
      this.closePopup();
      return;
    }

    if (this.uploadedFile) {
      const targetType = this.uploadIsFrom;
      const formData = new FormData();
      formData.append('files', this.uploadedFile);
      formData.append('type', targetType);
      this.callUploadnediaSection(formData, targetType);
    }
  }
  async urlToFile(url: string, filename: string): Promise<File> {
    const response = await fetch(url);
    const blob = await response.blob();
    return new File([blob], filename, { type: blob.type });
  }

  callUploadnediaSection(formData: any, fallbackType?: string) {
    // console.log('formData==>', formData);

    this.dataService
      .postForm('gallery', formData)
      .pipe(
        catchError((err) => {
          return of(null);
        })
      )
      .subscribe((res: any) => {
        // console.log('Response:', res);
        const uploadItems = Array.isArray(res?.data)
          ? res.data
          : res?.data
          ? [res.data]
          : [];

        if (uploadItems.length === 0 && (res?.url || res?.path || res?.src)) {
          uploadItems.push(res);
        }

        if (uploadItems.length > 0) {
          const uploadedGalleryItems = uploadItems?.map((item: any) => ({
              ...item,
              url: item?.url || item?.path || item?.src,
            }))
            .filter((item: any) => !!item.url);

          for (const element of uploadItems) {
            const resolvedType = element?.type || fallbackType;
            const resolvedUrl = element?.url || element?.path || element?.src;
            this.applyUploadedImage(resolvedType, resolvedUrl);
          }

          if (uploadedGalleryItems.length > 0) {
            const existingUrls = new Set((this.desktopLogoData || [])?.map((item: any) => item?.url));
            const freshItems = uploadedGalleryItems.filter((item: any) => !existingUrls.has(item.url));
            this.desktopLogoData = [...freshItems, ...(this.desktopLogoData || [])];

            const latest = freshItems[0] || uploadedGalleryItems[0];
            this.imagePreview = latest.url;
          }

          this.touchSettingsForUi();
          this.cdr.detectChanges();
          this.getImageApi();
           this.closePopup();
        }
      });
  }
  closePopup() {
    if (this.modalRef) {
      this.modalRef.close();
      this.modalRef = undefined;
    }
    this.resetUploadState();
    this.getImageApi();
  }
 toggleExternalLinkInput(footer: any) {
  footer.showExternalInput = true;
}
isValidExternalUrl(value: string): boolean {
  const url = value.trim();

  // allows http://, https://, www.
  const pattern = /^(https?:\/\/|www\.)[^\s/$.?#].[^\s]*$/i;

  return pattern.test(url);
}
saveExternalLink(footer: any) {
  const value = footer.externalLinkValue?.trim();
  if (!value) return;
  if (!this.isValidExternalUrl(value)) {
  footer.invalidUrl = true;
  return;
}
footer.invalidUrl = false;
//  if (!this.isValidExternalUrl(value)) {
//     alert('Please enter a valid URL (http, https, or www)');
//     return;
//   }
  footer.pageList.push({
    slug: footer.externalLinkValue.trim(),
    isSelected: false,
    isExternal: true
  });

  footer.externalLinkValue = '';
  footer.showExternalInput = false;
}
cancelExternalLink(footer: any) {
  footer.externalLinkValue = '';
  footer.showExternalInput = false;
}


}
