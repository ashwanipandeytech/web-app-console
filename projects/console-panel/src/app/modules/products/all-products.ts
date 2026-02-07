import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';

import { ActivatedRoute, Router } from '@angular/router';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { DataService } from 'shared-lib';
import {Sidebar} from "../../layout/sidebar/sidebar";
import {Header} from "../../layout/header/header";
import { ConfirmationPopupComponent } from '../../confirmationPopup/confirmationPopup.component';
import { MatDialog } from '@angular/material/dialog';
import { GlobalService } from '../../global.service';
import { AddProduct } from './add-product/add-product';
import { NgbModal, NgbModalRef, NgbTooltip } from '@ng-bootstrap/ng-bootstrap';
import { environment } from 'shared-lib/environments/environment';
@Component({
  selector: 'app-all-products',
  imports: [NgbTooltip],
  templateUrl: './all-products.html',
  styleUrl: './all-products.scss'
})



export class AllProducts {

  public dataService:any= inject(DataService);
  private activatedRoute= inject(ActivatedRoute);
  readonly dialog = inject(MatDialog);
  readonly ngbModal = inject(NgbModal);
  public router=inject(Router)
 //add toastr library private activatedRoute= inject(ActivatedRoute);
  email:any='superadmin@demohandler.com'
  password:any='R9!hQ7k$2Pm@A1eZx4LwT8uV#cN0sBf'
  productListData: any=[];
  allProducts: any[] = [];
  filteredProducts: any[] = [];
  categoryOptions: string[] = [];
  searchTerm = '';
  selectedCategory = 'all';
  selectedStock = 'all';
  selectedSort = 'newest';
  minPrice: number | null = null;
  maxPrice: number | null = null;
  defaultPage = 1;
  constructor(private cd:ChangeDetectorRef,private globalService:GlobalService) {
  this.callAllProductList()
  }
  callAllProductList() {
this.productListData = [];
    const payload = {
      email: this.email,
      password: this.password
    };
    this.dataService.get(`products?page=${this.defaultPage}`).pipe(
      catchError((error) => {
        console.error('Error occurred during login:', error);
       //add toaserfnc alert('Login failed: ' + response.message);
        // Optionally, you can return an observable to prevent further execution
        return of(null); // or you can return a default value if needed
      })
    ).subscribe((response: any) => {
      //console.log('Response:', response);
    this.productListData = response?.data || { data: [], meta: { links: [] } };
    this.allProducts = this.productListData?.data || [];
    this.refreshCategoryOptions();
    this.applyFilters();
    this.cd.detectChanges();
      if (response && response.success) {
      
      } else if (response) {
       //add toaserfnc alert('Login failed: ' + response.message);
      }
    });
    
  }
  nextPage(page:any){
if (!page) return;
this.defaultPage = page;
this.callAllProductList();
  }

  onSearch(event: Event) {
    this.searchTerm = (event.target as HTMLInputElement).value || '';
    this.applyFilters();
  }

  onCategoryChange(event: Event) {
    this.selectedCategory = (event.target as HTMLSelectElement).value || 'all';
    this.applyFilters();
  }

  onStockChange(event: Event) {
    this.selectedStock = (event.target as HTMLSelectElement).value || 'all';
    this.applyFilters();
  }

  onSortChange(event: Event) {
    this.selectedSort = (event.target as HTMLSelectElement).value || 'newest';
    this.applyFilters();
  }

  onMinPriceChange(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.minPrice = value ? Number(value) : null;
    this.applyFilters();
  }

  onMaxPriceChange(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.maxPrice = value ? Number(value) : null;
    this.applyFilters();
  }

  clearFilters() {
    this.searchTerm = '';
    this.selectedCategory = 'all';
    this.selectedStock = 'all';
    this.selectedSort = 'newest';
    this.minPrice = null;
    this.maxPrice = null;
    this.applyFilters();
  }

  refreshCategoryOptions() {
    const categories = new Set<string>();
    for (const item of this.allProducts) {
      const name = item?.category?.name;
      if (name) categories.add(name);
    }
    this.categoryOptions = Array.from(categories).sort();
  }

  applyFilters() {
    const term = this.searchTerm.trim().toLowerCase();
    let result = [...this.allProducts];

    if (term) {
      result = result.filter((item) => {
        const title = String(item?.title || '').toLowerCase();
        const sku = String(item?.sku || '').toLowerCase();
        return title.includes(term) || sku.includes(term);
      });
    }

    if (this.selectedCategory !== 'all') {
      result = result.filter(
        (item) => String(item?.category?.name || '') === this.selectedCategory
      );
    }

    if (this.selectedStock !== 'all') {
      result = result.filter((item) => {
        const qty = Number(
          item?.inventory?.manageStock ??
          item?.inventory?.quantity ??
          item?.inventory?.stock ??
          0
        );
        const status = String(
          item?.inventory?.stockStatus ?? item?.inventory?.status ?? ''
        ).toLowerCase();

        if (this.selectedStock === 'in') {
          return qty > 0 || status === 'in' || status === 'in_stock';
        }
        if (this.selectedStock === 'out') {
          return qty <= 0 || status === 'out' || status === 'out_of_stock';
        }
        if (this.selectedStock === 'backorder') {
          return status.includes('backorder');
        }
        return true;
      });
    }

    if (this.minPrice !== null || this.maxPrice !== null) {
      result = result.filter((item) => {
        const priceValue = this.getPriceValue(item);
        if (this.minPrice !== null && priceValue < this.minPrice) return false;
        if (this.maxPrice !== null && priceValue > this.maxPrice) return false;
        return true;
      });
    }

    result = this.sortProducts(result);

    this.filteredProducts = result;
  }

  getPriceValue(item: any): number {
    const sale = Number(item?.price_data?.salePrice);
    const regular = Number(item?.price_data?.regularPrice);
    if (!Number.isNaN(sale) && sale > 0) return sale;
    if (!Number.isNaN(regular)) return regular;
    return 0;
  }

  sortProducts(items: any[]): any[] {
    const list = [...items];
    switch (this.selectedSort) {
      case 'price_asc':
        return list.sort((a, b) => this.getPriceValue(a) - this.getPriceValue(b));
      case 'price_desc':
        return list.sort((a, b) => this.getPriceValue(b) - this.getPriceValue(a));
      case 'title_asc':
        return list.sort((a, b) =>
          String(a?.title || '').localeCompare(String(b?.title || ''))
        );
      case 'title_desc':
        return list.sort((a, b) =>
          String(b?.title || '').localeCompare(String(a?.title || ''))
        );
      case 'newest':
      default:
        return list.sort((a, b) => {
          const dateA = new Date(a?.published_at || a?.created_at || 0).getTime();
          const dateB = new Date(b?.published_at || b?.created_at || 0).getTime();
          return dateB - dateA;
        });
    }
  }
  openAddProductModal(action:any){
     const dialogRef: NgbModalRef = this.ngbModal.open(AddProduct, {
    windowClass: 'mobile-modal product-edit-popup',
    scrollable: true,
    centered: true,
    size:'xl',
    backdrop: 'static' // optional
  });
  // dialogRef.componentInstance.data = action;
    dialogRef.componentInstance.data = {
      data:null,
      mode: 'new' // 'new' | 'clone'
    };
  }
editoProduct(item:any){
  console.log('item==>',item);
  
   const dialogRef: NgbModalRef = this.ngbModal.open(AddProduct, {
    windowClass: 'mobile-modal product-edit-popup',
    scrollable: true,
    centered: true,
    size:'xl',
    backdrop: 'static' // optional
  });
  // dialogRef.componentInstance.data = item;
      dialogRef.componentInstance.data = {
      item,
      mode: 'update' // 'new' | 'clone'
    };

       dialogRef.result
      .then((result) => {
        console.log('Modal closed with result:', result);
        if (result == 'success') {
          this.callAllProductList();
        }
      })
      .catch((reason) => {
        //console.log('Modal dismissed:', reason);
      });
}

cloneProduct(item:any){
  console.log('item==>',item);
   const dialogRef: NgbModalRef = this.ngbModal.open(AddProduct, {
    windowClass: 'mobile-modal product-edit-popup',
    scrollable: true,
    centered: true,
    size:'xl',
    backdrop: 'static' // optional
  });
    dialogRef.componentInstance.data = {
      item,
      mode: 'clone' // 'new' | 'clone'
    };

       dialogRef.result
      .then((result) => {
        console.log('Modal closed with result:', result);
        if (result == 'success') {
          this.callAllProductList();
        }
      })
      .catch((reason) => {
        //console.log('Modal dismissed:', reason);
      });
}
    openDialog(id: any): void {
      let popupData = {
        title: 'Product',
        description: 'Are you sure, you want to delete Product',
        id: id
      }
      let dialogRef = this.dialog.open(ConfirmationPopupComponent, {
        width: '250px',
        data: popupData,
      });
      dialogRef.afterClosed().subscribe(result => {
        //console.log('Dialog closed with:', result);
  
        if (result.action === 'delete') {
          // Perform delete
          this.deleteProduct(result.id);
  
        }
      })
    }
    previewProduct(item:any){
      let url = `${environment.WEB_URL}/product-details/${item?.product_details?.permaLink}?id=${item.id}`
window.open(url,'_blank')
    }
      deleteProduct(id: any) {
    this.dataService.delete(`products/${id}`)
      .pipe(
        catchError(err => {
          console.error('Error:', err);
           setTimeout(() => {
          this.globalService.showMsgSnackBar(err);
        }, 100);
          return of(null);
        })
      )
      
      .subscribe((res: any) => {
        //console.log('Response:', res);
        this.callAllProductList();
          setTimeout(() => {
          this.globalService.showMsgSnackBar(res);
        }, 100);
        this.cd.detectChanges();
        // this.categoryListData = res.data;
      });
  }

}
