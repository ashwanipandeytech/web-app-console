import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { DataService } from 'projects/setting-component-shared-lib/src/lib/services/data-service';

@Component({
  selector: 'web-wishlist',
  imports: [],
  templateUrl: './wishlist.html',
  styleUrl: './wishlist.scss'
})
export class Wishlist {
  private dataService = inject(DataService);
  private cd = inject(ChangeDetectorRef);
  wishListData: any=[];
ngOnInit(){
 this.getWishlistData();
}


getWishlistData(){
  this.dataService.get('wishlist').subscribe((res:any)=>{
  this.wishListData = res.data;
  this.cd.markForCheck();
  })
}
}
