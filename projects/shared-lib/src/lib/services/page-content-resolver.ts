

import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { Observable, of, from } from 'rxjs';
import { catchError } from 'rxjs/operators'; 
import { PageContentFetcher } from './page-content-fetcher';
 
@Injectable({
  providedIn: 'root'
})
export class PageContentResolver implements Resolve<any> {
  constructor(private pageContent: PageContentFetcher) {}
  resolve(route: ActivatedRouteSnapshot): Observable<any> {  
    const content_type='page'
    const fieldValue=route.paramMap.get('pageSlug') || 'home';
    return of([]);
    // return from(this.pageContent.getContentByFieldName(content_type, fieldValue)).pipe(
    //   catchError(error => {
    //     return of('No data');
    //   })
    // );
  }
}