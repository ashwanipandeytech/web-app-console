import { AsyncPipe, CommonModule, NgComponentOutlet } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component, inject, ViewChild, ViewContainerRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PageComponentFactory } from 'shared-lib';
@Component({
  selector: 'host-outlet',
  standalone: true,
  imports: [NgComponentOutlet,CommonModule],
  templateUrl: './host-outlet.component.html',
  styleUrl: './host-outlet.component.scss'
})
export class HostOutletComponent { 
  public pageComponentFactory:any= inject(PageComponentFactory);
  private cd = inject(ChangeDetectorRef);
  private activatedRoute= inject(ActivatedRoute);
  private http  = inject(HttpClient);
  allInOnePageSections:any=[]

  @ViewChild('hostContainer', { read: ViewContainerRef, static: true })
  hostContainer!: ViewContainerRef;
  ngOnInit(): void {    
    this.http.get('/setting.component.json').subscribe((res: any) => {
    this.allInOnePageSections = res;
    this.cd.detectChanges();
//       res.map((item: any) => {  
//         let  templateVersion=item.templateCode
//         console.log('this.pageComponentFactory==>',this.pageComponentFactory);
// this.allInOnePageSections = templateVersion;

//        this.pageComponentFactory.loadComponentInstances(templateVersion, item, this.hostContainer);

//       })
});




    // this.activatedRoute.data.subscribe((response: any) => {
    //   console.info(response,'response')
    // //this.allInOnePageSections=response?.pageData;
    // response?.pageData.map((item: any) => {  
    //     let  templateVersion=item.fields.cComponentCode
    //     console.log('this.pageComponentFactory==>',this.pageComponentFactory);
    //    this.pageComponentFactory.loadComponentInstance('Block-C-22-v1', item, this.hostContainer);

    //   })
      
    // });
  }
 // await this.loaddynamicComponentService.loadComponentInstance(templateVersion, item, this.maincontentContainer, this.componentEntryId);

}

