import { AsyncPipe, CommonModule, NgComponentOutlet } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component, inject, ViewChild, ViewContainerRef } from '@angular/core';
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
  pageData:any
  isLoading = true;
  ngOnInit(): void {  
     setTimeout(() => {
    this.activatedRoute.data.subscribe((response: any) => {
    
      this.pageData=response?.pageData?.data?.settings;
        console.info(this.pageData,'pageData')
        this.isLoading = false;
      this.cd.detectChanges();
  
    });
    }, 1000);
  }

}

