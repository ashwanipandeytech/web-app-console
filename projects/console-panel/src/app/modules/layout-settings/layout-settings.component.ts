
import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, inject, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { catchError, of } from 'rxjs';
import { DataService } from 'shared-lib';
import {CdkDrag, CdkDragDrop, CdkDropList, moveItemInArray} from '@angular/cdk/drag-drop';
import { GlobalService } from '../../global.service';
declare var bootstrap: any;
@Component({
  selector: 'layout-settings',
  templateUrl: './layout-settings.component.html',
  imports: [FormsModule, CommonModule,CdkDrag,CdkDropList],
  styleUrls: ['./layout-settings.component.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LayoutSettingsComponent implements OnInit {
  settingsModel: any = {
    general: {
      logo: {
        desktop: {
          imgSrc: '',
          alt: ''
        },
        mobile: {
          imgSrc: '',
          alt: ''
        }
      },
      favico: {
        desktop: {
          imgSrc: '',
          alt: ''
        },
        mobile: {
          imgSrc: '',
          alt: ''
        }
      }
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
    social: [
      {
        label: 'facebook',
        link: ''
      }, {
        label: 'twitter',
        link: ''
      },
      {
        label: 'instagram',
        link: ''
      },
      {
        label: 'linkedin',
        link: ''
      },
      {
        label: 'youtube',
        link: ''
      },
      {
        label: 'pinterest',
        link: ''
      },
    ],
    contacts: {
      mobileNo: '',
      whatsappLink: '',
      email: '',
      address: ''
    }
  }
  loading = true
  public dataService: any = inject(DataService);
  private globalService:any = inject(GlobalService);
  pageList: any;
  uploadedFile:any;
  @ViewChild('uploadPhoto') uploadPhoto!: ElementRef;
  desktopLogoData: any=[];
  selectedImageobj: any=[];
  uploadIsFrom: any;
  constructor(private cdr: ChangeDetectorRef) { 
    this.getImageApi();
    // this.getDefaultImage();
  }

  ngOnInit() {

    // this.dataService.loadSetting().subscribe((d: any) => {
    //   // this.settingsModel.set(d || {});
    // this.settingsModel=d;
    // console.info(this.settingsModel)
    // this.cdr.detectChanges();


    //   this.loading=false
    // });





  
      this.getGeneralSetting()
  }
  getGeneralSetting(){
       this.dataService.get('settings/general')
      .pipe(
        catchError(err => {
          console.error('Error:', err);
          return of(null);
        })
      )
      .subscribe((res: any) => {
        //console.log('Response:', res);
        if (res.success) {
    

          this.settingsModel = res.data.settings;
         this.uploadedFile = this.settingsModel.general.logo.desktop.imgSrc
          
        

         this.getPageList()
          this.cdr.detectChanges()
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
  //       //console.log('Response:', res);
  //       if (res.data) {
  //         this.desktopLogoData = res.data;
  //         console.log('desktopLogoData',this.desktopLogoData);
          
  //         this.cdr.detectChanges();
  //       }
  //     })
  // }
  getSelectedImage(image:any){
console.log('image==>',image);
console.log('this.uploadIsFrom',this.uploadIsFrom);
image.isFrom = this.uploadIsFrom;
this.selectedImageobj.push(image);
  }
  getImageApi(){
      this.dataService.get('gallery')
      .pipe(
        catchError(err => {
          console.error('Error:', err);
          return of(null);
        })
      )
      .subscribe((res: any) => {
        //console.log('Response:', res);
        if (res.data) {
          this.desktopLogoData = res.data;
          console.log('desktopLogoData',this.desktopLogoData);
          
          this.cdr.detectChanges();
        }
      })
  }
  getPageList(){
        this.dataService.get('pages/list')
      .pipe(
        catchError(err => {
          console.error('Error:', err);
          return of(null);
        })
      )
      .subscribe((res: any) => {
        //console.log('Response:', res);
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
          this.settingsModel.footer.forEach((item: any) => {
  const pageList = JSON.parse(JSON.stringify(this.pageList));

  // Create a map for quick lookup of order
  const orderMap = new Map(
    item.items.map((inner: any, index: number) => [inner.link, index])
  );

  item.pageList = pageList
    .map((page: any) => ({
      ...page,
      isSelected: orderMap.has(page.slug)
    }))
    .sort((a: any, b: any) => {
      const aIndex:any = orderMap.get(a.slug);
      const bIndex:any = orderMap.get(b.slug);

      // Both exist in item.items → sort by that order
      if (aIndex !== undefined && bIndex !== undefined) {
        return aIndex - bIndex;
      }

      // Only one exists → selected first
      if (aIndex !== undefined) return -1;
      if (bIndex !== undefined) return 1;

      // Neither exists → keep original order
      return 0;
    });
});

          this.cdr.detectChanges()
        }

      });
  }

 drop(event: any,data:any) {
    moveItemInArray(data, event.previousIndex, event.currentIndex);
  }
  // Add new empty slide
  addSlide(type: string) {
    this.settingsModel[type].push({
      imgSrc: '',
      alt: '',
      url: ''
    });
  }

  // Delete slide by index
  deleteSlide(type: string, index: number) {
    if (this.settingsModel[type].length > 0) {
      this.settingsModel[type].splice(index, 1);
    }
  }
  addFooterColumn() {
    this.settingsModel.footer.push({
      colHeading: '',
      pageList:JSON.parse(JSON.stringify(this.pageList)),
      items: [ {
        "label": "",
        "link": "",
        "isSelected":false
      }]
    });

        
          

  }
  deleteFooterColumn(index: number) {
    this.settingsModel.footer.splice(index, 1);


  }

  addFooterColumnData(data: any) {


    data.push(
      {
        "label": "",
        "link": ""
      }
    );

  }
  deleteFooterColumnData(data: any, index: number) {
    data.splice(index, 1);


  }
  saveSettings() {
    let settingData=JSON.parse(JSON.stringify(this.settingsModel))
   
   for (let i = 0; i < settingData.footer.length; i++) {
   
    let data=settingData.footer[i].pageList.filter((item: any) => item.isSelected);
     settingData.footer[i].items = [];
    data.map((item:any)=>{
     settingData.footer[i].items.push({
        "label": item.title,
        "link": item.slug
      })
    })
   // this.settingsModel.footer[i].items = 
    
    // Delete the 'pageList' property
    delete settingData.footer[i].pageList;
}
 let payload = {
      settings_name: 'general',
      settings: settingData
    }

   // console.info('this.settingsModel',this.settingsModel)
   // return
    this.dataService.post(payload, 'settings')
      .pipe(
        catchError(err => {
          console.error('Error:', err);
           this.globalService.showMsgSnackBar(err);
          return of(null);
        })
      )
      .subscribe((res: any) => {
        //console.log('Response:', res);
        if (res.success) {
  this.globalService.showMsgSnackBar(res);
  this.getGeneralSetting()

        }

      });
  }

  imagePreview: string | null = null;

  onImageChange(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    this.uploadedFile = file;
    console.log('this.uploadedFile==>',this.uploadedFile);
    
    this.cdr.detectChanges();
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => (this.imagePreview = reader.result as string);
    reader.readAsDataURL(file);
  }

  removeImage(event: MouseEvent) {
    event.stopPropagation();
    this.imagePreview = null;
  }

uploadFrom(from:any){
this.uploadIsFrom = from;
}
  savedImage(){
console.log('uploadedFile==>',this.uploadedFile);
console.log('uploadisFrom',this.uploadIsFrom);

console.log('this.selectedImageobj?.type==>',this.selectedImageobj);
  // for (const file of this.uploadedFile) {

if (this.selectedImageobj.length>0) {
  
  for (let i = 0; i < this.selectedImageobj.length; i++) {
    const element = this.selectedImageobj[i];
    if (element.isFrom == 'desktop') {
    this.settingsModel.general.logo.desktop.imgSrc = element.url;
    }
     if (element.isFrom == 'mobile') {
    this.settingsModel.general.logo.mobile.imgSrc = element.url;
    }
    if (element.isFrom == 'fav_mobile') {
    this.settingsModel.general.favico.mobile.imgSrc = element.url;
    }
    if (element.isFrom == 'fav_desktop') {
    this.settingsModel.general.favico.desktop.imgSrc = element.url;
    }
       if (element.isFrom == 'slider') {
for (let j = 0; j < this.settingsModel.home_Banner_Slider.length; j++) {
  const banner = this.settingsModel.home_Banner_Slider[j];
  banner.imgSrc=element.url;
}
       }
  }
  for (const file of this.selectedImageobj) {
    const formData = new FormData();
      formData.append('files', file);
    formData.append('type', file.isFrom);
    this.callUploadnediaSection(formData);
    this.closePopup();

  }
}
else{

  // if (this.uploadIsFrom == "desktop") {
  // this.settingsModel.general.logo.desktop.imgSrc = this.selectedImageobj.url;
  //   console.log('this.settingsModel==>',this.settingsModel.general.logo.desktop.imgSrc.alt);
  //   // this.settingsModel
  // }
  // if (this.uploadIsFrom == "mobile") {
  // this.settingsModel.general.logo.mobile.imgSrc = this.selectedImageobj.url;
  //   console.log('this.settingsModel==>',this.settingsModel.general.logo.desktop.imgSrc.alt);
  //   // this.settingsModel
  // }
    const formData = new FormData();
    formData.append('files', this.uploadedFile);
    formData.append('type', this.uploadIsFrom);
    this.callUploadnediaSection(formData);
    this.closePopup();
}
  // }
  }
  callUploadnediaSection(formData:any){
  //console.log('formData==>',formData);
  
    this.dataService.postForm('gallery',formData)
      .pipe(
        catchError(err => {
          return of(null);
        })
      )
      .subscribe((res: any) => {
        console.log('Response:', res);
        if (res?.data) {
          for (let i = 0; i < res.data.length; i++) {
            const element = res.data[i];
            if (element.type == "desktop") {
            this.settingsModel.general.logo.desktop.imgSrc = element.url;
              console.log('this.settingsModel==>',this.settingsModel.general.logo.desktop.imgSrc.alt);
              this.cdr.detectChanges();
              // this.settingsModel
            }
            if (element.type == "mobile") {
            this.settingsModel.general.logo.mobile.imgSrc = element.url;
              console.log('this.settingsModel==>',this.settingsModel.general.logo.desktop.imgSrc.alt);
              this.cdr.detectChanges();
              // this.settingsModel
            }
             if (element.isFrom == 'fav_mobile') {
    this.settingsModel.general.favico.mobile.imgSrc = element.url;
              this.cdr.detectChanges();

    }
    if (element.isFrom == 'fav_desktop') {
    this.settingsModel.general.favico.desktop.imgSrc = element.url;
              this.cdr.detectChanges();

    }
      if (element.isFrom == 'slider') {
for (let j = 0; j < this.settingsModel.home_Banner_Slider.length; j++) {
  const banner = this.settingsModel.home_Banner_Slider[j];
  banner.imgSrc.push(element.url);
}
              this.cdr.detectChanges();

    }
            
          }
        }
      });
}
  closePopup(){
     const modal = bootstrap.Modal.getInstance(
        this.uploadPhoto.nativeElement
      );
      modal.hide();
      this.getImageApi();
  }
}
