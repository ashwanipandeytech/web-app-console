

import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { Observable, of, from } from 'rxjs';
import { catchError } from 'rxjs/operators'; 
import { PageContentFetcher } from './page-content-fetcher';
import { DataService } from './data-service';

 
@Injectable({
  providedIn: 'root'
})
export class PageContentResolver implements Resolve<any> {
  constructor(private pageContent: PageContentFetcher,private dataService:DataService) {}
  resolve(route: ActivatedRouteSnapshot,state: RouterStateSnapshot): Observable<any> {  
   const currentUrl = state.url;
  
    const path = route.url.map(segment => segment.path).join('/');
    const fieldValue=route.paramMap.get('pageSlug') || 'home';
    //return of([]);
    return from(this.dataService.get('pages'+currentUrl)).pipe(
      catchError(error => {
        return of('No data');
      })
    );
  }
}