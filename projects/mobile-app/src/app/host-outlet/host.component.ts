import { AsyncPipe, NgComponentOutlet, NgFor, NgIf } from '@angular/common';
import { Component, inject, ViewChild, ViewContainerRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PageComponentFactory } from 'shared-lib';
@Component({
  selector: 'host-outlet',
  standalone: true,
  imports: [NgComponentOutlet, NgIf,NgFor],
  templateUrl: './host-outlet.component.html',
  styleUrl: './host-outlet.component.scss'
})
export class HostOutletComponent { 
  public pageComponentFactory= inject(PageComponentFactory);
  private activatedRoute= inject(ActivatedRoute);
  allInOnePageSections:any=[]

 
  @ViewChild('hostContainer', { read: ViewContainerRef, static: true })
  hostContainer!: ViewContainerRef;
  ngOnInit(): void {    
    this.activatedRoute.data.subscribe((response: any) => {
      console.info(response,'response')
     
    //this.allInOnePageSections=response?.pageData;
    response?.pageData.map((item: any) => {  
        let  templateVersion=item.fields.cComponentCode
      // this.pageComponentFactory.loadComponentInstance('Block-C-22-v1', item, this.hostContainer);

      })
      
    });
  }
 // await this.loaddynamicComponentService.loadComponentInstance(templateVersion, item, this.maincontentContainer, this.componentEntryId);

}

