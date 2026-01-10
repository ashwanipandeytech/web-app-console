import { AsyncPipe, CommonModule, NgComponentOutlet } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component, inject, ViewChild, ViewContainerRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { catchError, of } from 'rxjs';
import { PageComponentFactory } from '../../services/page-component-factory';
import { DataService } from '../../services/data-service';
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
  private dataService = inject(DataService);
  private http  = inject(HttpClient);
  allInOnePageSections:any=[]
  ngOnInit(): void {    
    this.http.get('/setting.component.json').subscribe((res: any) => {
    this.allInOnePageSections = res;
    // this.dataService.get('settings/general')
    //   .pipe(
    //     catchError(err => {
    //       console.error('Error:', err);
    //       return of(null);
    //     })
    //   )
    //   .subscribe((res: any) => {
    //     if (res.success) {
    //       console.log('Response:', res.data.settings);
    //       this.allInOnePageSections.push({settings:res.data.settings})
    //     }
    //   })
    this.cd.detectChanges();

});




    // this.activatedRoute.data.subscribe((response: any) => {
    //   console.info(response,'response')
    // //this.allInOnePageSections=response?.pageData;
    // response?.pageData.map((item: any) => {  
    //     let  templateVersion=item.fields.cComponentCode
    //     //console.log('this.pageComponentFactory==>',this.pageComponentFactory);
    //    this.pageComponentFactory.loadComponentInstance('Block-C-22-v1', item, this.hostContainer);

    //   })
      
    // });
  }

}

