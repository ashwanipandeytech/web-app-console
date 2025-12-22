
import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { catchError, of } from 'rxjs';
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
  constructor(private cdr: ChangeDetectorRef) { }

  ngOnInit() {

    // this.dataService.loadSetting().subscribe((d: any) => {
    //   // this.settingsModel.set(d || {});
    // this.settingsModel=d;
    // console.info(this.settingsModel)
    // this.cdr.detectChanges();


    //   this.loading=false
    // });



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
          // this.settingsModel.footer = [
          //   {
          //     "colHeading": "",
          //     "items": [
          //       {
          //         "label": "",
          //         "link": ""
          //       }
          //     ]
          //   },
          //   {
          //     "colHeading": "",
          //     "items": [
          //       {
          //         "label": "",
          //         "link": ""
          //       }
          //     ]
          //   }, {
          //     "colHeading": "",
          //     "items": [
          //       {
          //         "label": "",
          //         "link": ""
          //       }
          //     ]
          //   }
          // ]
          this.cdr.detectChanges()
        }

      });
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
      items: [ {
        "label": "",
        "link": ""
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
    let payload = {
      settings_name: 'general',
      settings: this.settingsModel
    }
    this.dataService.post(payload, 'settings')
      .pipe(
        catchError(err => {
          console.error('Error:', err);
          return of(null);
        })
      )
      .subscribe((res: any) => {
        console.log('Response:', res);
        if (res.data) {


        }

      });
  }


}
