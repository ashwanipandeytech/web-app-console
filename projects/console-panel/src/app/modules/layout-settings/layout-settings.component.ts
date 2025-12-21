
import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DataService } from 'shared-lib';
@Component({
  selector: 'layout-settings',
  templateUrl: './layout-settings.component.html',
  imports: [FormsModule, CommonModule],
  styleUrls: ['./layout-settings.component.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LayoutSettingsComponent implements OnInit {
 settingsModel={
  general: {
    logo: {
      desktop: {
        imgSrc:'',
        alt:''
      },
      mobile: {
         imgSrc:'',
        alt:''
      }
    },
    favico: {
      desktop: {
        imgSrc:'',
        alt:''
      },
      mobile: {
         imgSrc:'',
        alt:''
      }
    }
  },
  home_slider:[
    {
        imgSrc:'',
        alt:'',
        url:'',
    },
    {
       imgSrc:'',
        alt:'',
        url:'',
    },
  ],
  social: [
  {
    label:'facebook',
    link:''
  },{
    label:'twitter',
    link:''
  },
  {
    label:'instagram',
    link:''
  },
  {
    label:'linkedin',
    link:''
  },
  {
    label:'youtube',
    link:''
  },
  {
    label:'pinterest',
    link:''
  },
  ],
  contacts:{
     mobileNo:'',
     whatsappLink:'',
     email:'',
     address:''
  }
}
 loading=true
 public dataService: any = inject(DataService);
  constructor(private cdr: ChangeDetectorRef) { }

  ngOnInit() {

     this.dataService.loadSetting().subscribe((d: any) => {
      // this.settingsModel.set(d || {});
    this.settingsModel=d;
    this.cdr.detectChanges();
    
     
      this.loading=false
    });
  }

 // Add new empty slide
  addSlide() {
    this.settingsModel.home_slider.push({
      imgSrc: '',
      alt: '',
      url: ''
    });
  }

  // Delete slide by index
  deleteSlide(index: number) {
    if (this.settingsModel.home_slider.length > 0) {
      this.settingsModel.home_slider.splice(index, 1);
    }
  }
  saveSettings() {
    console.log('Saving settings:', this.settingsModel);
  }
}
