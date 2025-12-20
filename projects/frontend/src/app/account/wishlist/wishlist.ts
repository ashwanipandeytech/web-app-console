import { ChangeDetectorRef, Component, ElementRef, inject, ViewChild } from '@angular/core';
import { DataService } from 'projects/setting-component-shared-lib/src/lib/services/data-service';
import { GlobaCommonlService } from 'projects/global-common.service';
declare var bootstrap: any;

@Component({
  selector: 'web-wishlist',
  imports: [],
  templateUrl: './wishlist.html',
  styleUrl: './wishlist.scss'
})
export class Wishlist {
  @ViewChild('removeProduct') removeProduct!: ElementRef;

  private dataService = inject(DataService);
  private globalCommonService = inject(GlobaCommonlService)
  private cd = inject(ChangeDetectorRef);
  wishListData: any=[];
  WishListId: any;
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
this.WishListId = id;
}
remove(){
  this.dataService.delete('wishlist',this.WishListId).subscribe((res:any)=>{
    let response = {
        message:'Item Removed from Wish List',
        success:true
    }
     const modal = bootstrap.Modal.getInstance(
        this.removeProduct.nativeElement
      );
      modal.hide();
  this.globalCommonService.showMsgSnackBar(response);
  this.getWishlistData();
  this.cd.markForCheck();
  })
}
}
