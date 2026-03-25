import { AsyncPipe, CommonModule, NgComponentOutlet } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component, inject, ViewChild, ViewContainerRef } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { PageComponentFactory } from 'shared-lib';
import { DataService } from 'shared-lib';
import { Header } from '../layout/header/header';
import { Footer } from '../layout/footer/footer';
@Component({
  selector: 'host-outlet',
  standalone: true,
  imports: [CommonModule,Header,Footer],
  templateUrl: 'backend-pages.html',
  styleUrl: 'backend-pages.scss'
})
export class BackendPagesComponent { 
  public pageComponentFactory:any= inject(PageComponentFactory);
  private cd = inject(ChangeDetectorRef);
  private activatedRoute= inject(ActivatedRoute);
  private http  = inject(HttpClient);
  private sanitizer = inject(DomSanitizer);
  pageData:any
  isLoading = true;
  ngOnInit(): void {  
     setTimeout(() => {
    this.activatedRoute.data.subscribe((response: any) => {
    
      this.pageData=response?.pageData?.data?.settings;
        if (this.pageData) {
          if (this.pageData.description) {
            this.pageData.description = this.sanitizer.bypassSecurityTrustHtml(this.pageData.description);
          }
          if (this.pageData.pageContent) {
            this.pageData.pageContent = this.sanitizer.bypassSecurityTrustHtml(this.pageData.pageContent);
          }
        }
        console.info(this.pageData,'pageData')
        this.isLoading = false;
      this.cd.detectChanges();
  
    });
    }, 1000);
  }

}

