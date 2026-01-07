import { ChangeDetectorRef, Component, inject, OnInit, } from '@angular/core';
import { CommonModule, NgComponentOutlet } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { PageComponentFactory } from '../../services/page-component-factory';
@Component({
  selector: 'app-host-product-infoo',
  templateUrl: './host-product-infoo.component.html',
  imports: [CommonModule,NgComponentOutlet],
  styleUrls: ['./host-product-infoo.component.scss']
})
export class HostProductInfooComponent implements OnInit {
allInOnePageSections:any = [];
  public pageComponentFactory:any= inject(PageComponentFactory);
private cd = inject(ChangeDetectorRef);
  private http  = inject(HttpClient);
  constructor() { }

  ngOnInit() {
      this.http.get('/product-detail.component.json').subscribe((res: any) => {
      console.log('allInOnePageSections===>',res);
      
    this.allInOnePageSections = res;
    this.cd.detectChanges();

      
  })
  }

}
