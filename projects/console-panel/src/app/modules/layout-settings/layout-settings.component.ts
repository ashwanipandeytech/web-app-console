
import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { catchError, of } from 'rxjs';
import { DataService } from 'shared-lib';
import {CdkDrag, CdkDragDrop, CdkDropList, moveItemInArray} from '@angular/cdk/drag-drop';
import { GlobalService } from '../../global.service';
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
  constructor(private cdr: ChangeDetectorRef) { }

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
        console.log('Response:', res);
        if (res.success) {
          this.settingsModel = res.data.settings;

         this.getPageList()
          this.cdr.detectChanges()
        }

      });
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
        console.log('Response:', res);
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
        console.log('Response:', res);
        if (res.success) {
  this.globalService.showMsgSnackBar(res);
  this.getGeneralSetting()

        }

      });
  }


}
