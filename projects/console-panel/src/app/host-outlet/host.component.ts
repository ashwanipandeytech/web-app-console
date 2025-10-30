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
   
// step1 check from localstorage whether user exist of not
// step2 if user exist then redirect to dashboard
// step3 if user not exist then show login (toggle it from html selector)

  }
 // await this.loaddynamicComponentService.loadComponentInstance(templateVersion, item, this.maincontentContainer, this.componentEntryId);

}

