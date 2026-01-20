import { ChangeDetectorRef, Component, inject, ViewChild } from '@angular/core';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { Sidebar } from '../../layout/sidebar/sidebar';
import { Header } from '../../layout/header/header';
import { DataService } from 'shared-lib/services/data-service';
import { catchError, of } from 'rxjs';
// import { MatPaginator } from 'node_modules/@angular/material/paginator.d';
// import { MatSort } from 'node_modules/@angular/material/sort.d';

@Component({
  selector: 'app-customers',
  imports: [Sidebar, Header, MatTableModule],
  templateUrl: './customers.html',
  styleUrl: './customers.scss',
})
export class Customers {
  private dataService = inject(DataService);
  private cd = inject(ChangeDetectorRef);
  customerList: any = [];
  constructor() {}

  displayedColumns: string[] = [
    'name',
    'is_active',
    'created_at',
    'email',
    'orders_count',
    'total_spent',
    'cart_count',
    'wishlist_count',
    'country'
  ];

  dataSource = new MatTableDataSource<any>();

  // @ViewChild(MatPaginator) paginator!: MatPaginator;
  // @ViewChild(MatSort) sort!: MatSort;

  // Call this after API data load
  // setCustomerData(customerList: any[]) {
  //   this.dataSource.data = customerList;
  // }

  // ngAfterViewInit() {
  //   this.dataSource.paginator = this.paginator;
  //   this.dataSource.sort = this.sort;
  // }


  ngOnInit() {
    this.getCustomerList();
  }
  getCustomerList() {
    this.dataService
      .get('users?per_page=5')
      .pipe(
        catchError((err) => {
          console.error('Error:', err);
          return of(err);
        }),
      )
      .subscribe((res: any) => {
        let filteredData = [];
        console.log('Response:', res);
        if (res?.data) {
          // this.customerList = res.data.data;
          this.dataSource.data = res.data.data;
          this.cd.detectChanges();
        }
      });
  }
}
