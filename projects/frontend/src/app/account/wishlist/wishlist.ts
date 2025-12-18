import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { DataService } from 'projects/setting-component-shared-lib/src/lib/services/data-service';
import { GlobaCommonlService } from 'projects/global-common.service';


@Component({
  selector: 'web-wishlist',
  imports: [],
  templateUrl: './wishlist.html',
  styleUrl: './wishlist.scss'
})
export class Wishlist {
  private dataService = inject(DataService);
  private globalCommonService = inject(GlobaCommonlService)
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
removeWishlist(id:any){
  this.dataService.delete('wishlist',id).subscribe((res:any)=>{
    let response = {
        message:'Item Removed from Wish List',
        success:true
    }
  this.globalCommonService.showMsgSnackBar(response);
  this.getWishlistData();
  this.cd.markForCheck();
  })
}
}
