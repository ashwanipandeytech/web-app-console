import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
// import { environment } from '#environments';
import { createClient } from 'contentful';
import { isPlatformBrowser } from '@angular/common';
@Injectable({
  providedIn: 'root'
})
export class PageContentFetcher {
  langCode = 'de-AT';
  viewType
  // private cdaClient = createClient({
  //   space: environment[environment.countrySlug].CONTENTFULCONFIG.space,
  //   accessToken: environment[environment.countrySlug].CONTENTFULCONFIG.accessToken,
  //   environment: environment[environment.countrySlug].CONTENTFULCONFIG.environment

  // });
  
  constructor(){
    this.viewType = 'Desktop'
  }
 
  // getContentByFieldName(content_type: any, fieldValue: any, query?: object) {
  //   let queryObject: any;
  //   queryObject = Object.assign({content_type: content_type,locale: this.langCode,'fields.pageSlug': fieldValue,include: 5,}, query);
  //   if (content_type == 'seoMetadata') {
  //     queryObject['fields.url'] = fieldValue;
  //     delete queryObject['fields.pageSlug'];
  //   }
  //   return this.cdaClient.getEntries(queryObject)
  //     .then(res => {
  //       if (res.items.length > 0) {         
  //         return  this.prepareDataInSequence(res.items[0]?.fields);;
  //       } else {
  //         return null;
  //       }
  //     });
  // }
  // private prepareDataInSequence(data: any): any[] {
  //   // Merge non-empty arrays in sequence
  //   const wholePageContent = [data?.topSection || [],data?.pageContent || [],data?.pageFooter || []]
  //     .filter(arr => arr?.length > 0).flat();
  //   // Process items and filter out undefined/invalid results
  //   return wholePageContent.map(item => this.processItem(item)).filter(item => item !== undefined); // Exclude undefined items
  // }

  // private processItem(item: any): any | undefined {
  //   const fields = item?.fields;
  //   if (!fields) return undefined;
  //   // Assign cComponentCode based on available design version or template
  //   const templateVersion =
  //     fields.heroBannerDesignVersion ||fields.txtBlockSelectDesignTemplate ||fields.imageBoxCarouselDesignVersion ||
  //     fields.bodyTxtSelectDesign ||fields.testimonialBlockDesign ||fields.templateCode ||fields.sliderDesignVersion;

  //   if (!templateVersion) return undefined; // Skip if no valid template version
  //   fields.cComponentCode = templateVersion;
  //   // Check restrictions and view compatibility
  //   const isRestricted = fields.doNotDisplayOn?.includes(environment[environment.countrySlug]?.oemCode);
  //   const displayOn = fields.displayOn || 'Desktop and Mobile';
  //   const isViewCompatible =
  //     (this.viewType === 'Mobile' && ['Desktop and Mobile', 'Mobile'].includes(displayOn)) ||
  //     (this.viewType === 'Desktop' && ['Desktop and Mobile', 'Desktop'].includes(displayOn));

  //   // Return item only if conditions are met
  //   if (!isRestricted && isViewCompatible && !fields.selectDesign) {
  //    // //console.log('Processing item:', item);
  //     return item;
  //   }

  //   return undefined; // Exclude item if conditions fail
  // }

  
}

