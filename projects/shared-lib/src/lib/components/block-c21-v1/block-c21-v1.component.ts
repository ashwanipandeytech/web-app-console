import { isPlatformBrowser, isPlatformServer } from '@angular/common';
import {Component,OnInit,ChangeDetectionStrategy,ViewEncapsulation, Input, TransferState, makeStateKey, PLATFORM_ID, Inject, inject,} from '@angular/core';
import { Router } from '@angular/router';
import { documentToHtmlString } from '@contentful/rich-text-html-renderer';
import { PageMarkUp } from './../../services/page-mark-up';
// import * as global from 'src/app/globals';
// import { ContentfulService } from 'src/app/services/contentful.service';

const CONTENTFUL_DATA_KEY = (component: string) => makeStateKey<any>(`contentful-data-${component}`);

const CONTENTFUL_COMP_ID = (component: string) => makeStateKey<any>(`contentful-comp-id-${component}`);




@Component({
  selector: 'app-block-c21-v1',
  templateUrl: './block-c21-v1.component.html',
  styleUrls: ['./block-c21-v1.component.scss'],
  host: { '[id]': 'componentId' },
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [],
})
export class blockC21v1Component implements OnInit {
  componentName: any;
  bgColorWithBlur: any;
  componentId: any;

componentCData: any;
  @Input() data: any;
  @Input() templateversion:any;
  private platformId = inject(PLATFORM_ID);
  private transferState = inject(TransferState);
  private pageMarkup = inject(PageMarkUp);
  // private contentfulService = inject(ContentfulService);
  // private dynamicLoader = inject(DynamicLoaderService);
  private router = inject(Router);
  

  hexToRgba(hex: string, opacity: number): string {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }

  ngOnInit(): void {

    //1. IS PLATFORM BROWSER
   
return
    this.componentCData = CONTENTFUL_DATA_KEY(this.data.sys.id);   
   if (isPlatformBrowser(this.platformId)  && this.transferState.hasKey(this.componentCData) )
   
 {
     
      
 this.data= this.transferState.get(this.componentCData, null);
      this.componentId== this.data.sys.id;
      console.info('server has data');
      return
    }
   this.loadCData()

  }
;
  loadCData(){
    if (this.data) {
    //  console.warn('server has not data');
      // console.log("c-21 && c-22-v1>>", this.data)
      this.componentId = this.data.sys.id;
      let fields = this.data.fields;

      this.componentName =
        fields.heroBannerDesignVersion ||
        fields.txtBlockSelectDesignTemplate ||
        fields.imageBoxCarouselDesignVersion ||
        fields.bodyTxtSelectDesign ||
        fields.testimonialBlockDesign ||
        fields.templateCode;
    
      if (fields) {
        if (fields && fields.blockBg) {
          fields.componentBgColor = this.hexToRgba('#' + fields.blockBg.split('_')[0],0.7);
        }
        if (fields && fields.blockTx) {
          fields.blockTextColor = '#' + fields.blockTx.split('_')[0];
        }
        if (fields.subHeroSectionHeader) {
          fields.ctaText = documentToHtmlString(fields.subHeroSectionHeader,this.pageMarkup.embeddedImage);
          fields.ctaText = this.pageMarkup.removeBlankTags(fields.ctaText);
        }
        if (fields.subHeroBodyTxt) {
          fields.subHeroBodyTxt = documentToHtmlString(fields.subHeroBodyTxt,this.pageMarkup.embeddedImage);
          fields.subHeroBodyTxt = this.pageMarkup.removeBlankTags(fields.subHeroBodyTxt);
        }
        if (fields.subHeroTxtSubHeader) {}
        if (fields.subHeroBodyCtas) {
          let buttons = fields.subHeroBodyCtas;
          for (let i = 0; i < buttons.length; i++) {

            if (buttons[i].fields && buttons[i].fields.ctaBgColor) {
              buttons[i].fields.ctaBgColorVal = '#' + buttons[i].fields.ctaBgColor.split('_')[0];
            }
            if (buttons[i].fields && buttons[i].fields.ctaTxColor) {
              buttons[i].fields.ctaTextColorVal = '#' + buttons[i].fields.ctaTxColor.split('_')[0];
            }
            if (buttons[i].fields && buttons[i].fields.ctaTagColor) {
              buttons[i].fields.taglineColorVal = '#' + buttons[i].fields.ctaTagColor.split('_')[0];
            }
          }
        }
        if (this.data.fields.subHeroBodyCtas) {
          let buttons = this.data.fields.subHeroBodyCtas;
          for (let i = 0; i < buttons.length; i++) {
            if (buttons[i].fields) {
              //condtional calling for anchor link starts
              if (
                (buttons[i].fields && buttons[i].fields.action == undefined) || buttons[i].fields.action == '') {
                // buttons[i].fields.normal = this.contentfulService.performCtaActions(
                //   buttons[i].fields,false,this.componentName
                // );
              }
             // buttons[i].tagLink = this.contentfulService.performCtaActions(buttons[i].fields,'ctaTaglineLink');
              //condtional calling for anchor link ends
            }
          }
        }
      }

      if(isPlatformServer(this.platformId)){
        this.transferState.set(this.componentCData, this.data);

      }
    }
  }
}
