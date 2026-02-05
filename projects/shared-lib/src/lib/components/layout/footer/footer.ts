import { CommonModule, JsonPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { DataService } from '../../../services/data-service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'web-footer',
  imports: [JsonPipe,CommonModule,RouterLink],
  templateUrl: './footer.html',
  styleUrl: './footer.scss'
})
export class Footer {
 public dataService=inject(DataService);
  footerData: any=[];
 ngOnInit(){
   console.log('dataService.getSpecificGeneralSetting',this.dataService.getSpecificGeneralSettings('footer'));
 this.footerData = this.dataService.getSpecificGeneralSettings('footer');
 }
}
