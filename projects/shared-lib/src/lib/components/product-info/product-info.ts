import { CommonModule, NgComponentOutlet } from '@angular/common';
import { ChangeDetectorRef, Component, ElementRef, inject, Renderer2, ViewChild } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, of } from 'rxjs';
import { DataService } from 'shared-lib';
import { SlickCarouselModule  } from 'ngx-slick-carousel';
import { GlobaCommonlService } from '../../../../../global-common.service';
import { HttpClient } from '@angular/common/http';
import { PageComponentFactory } from 'shared-lib';
import {HostProductInfooComponent} from '../host-product-infoo/host-product-infoo.component'

@Component({
  selector: 'web-product-info',
  imports: [CommonModule,NgComponentOutlet,HostProductInfooComponent],
  templateUrl: './product-info.html',
  styleUrl: './product-info.scss'
})
export class ProductDetailCommon {
allInOnePageSections:any = [];
  public pageComponentFactory:any= inject(PageComponentFactory);

  private http  = inject(HttpClient);
  constructor(private cd:ChangeDetectorRef,private route:ActivatedRoute, private sanitizer: DomSanitizer, private renderer: Renderer2,private router: Router){
  }


  ngOnInit(){
    this.http.get('/product-detail.component.json').subscribe((res: any) => {
      console.log('allInOnePageSections===>',res);
      
    this.allInOnePageSections = res;
    this.cd.detectChanges();
      
  })
  }
}