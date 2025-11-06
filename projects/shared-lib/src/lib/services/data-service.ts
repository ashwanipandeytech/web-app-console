import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
// import { environment } from '#environments';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, ReplaySubject, takeUntil } from 'rxjs';
import { Commonresponseobject } from '../model/responsemodel';
@Injectable({
  providedIn: 'root'
})
export class UserService {
    //userid = JSON.parse(localStorage.getItem('user'))['ID'];
    constructor(private http: HttpClient) { }
    httpOptions = {
      headers: new HttpHeaders({
        //'Authorization': environment[window['environmentType']].Auth_Key,
        'Content-Type': 'application/json'
  
      })
    };
  
    callApi(data: any, apiEndPoint: any) {
      const requestPayload = {
        //application: environment[window['environmentType']].APPLICATION,
//version: environment[window['environmentType']].VERSION,
        data
      };
      const consolecolor = 'font-size:12px; font-weight: bold;padding:3px 2px;color:';
      // console.log('%c' + apiEndPoint + ':', consolecolor + 'green');
      // console.dir(apiEndPoint + ':' + JSON.stringify(requestPayload, null, 2));
     // return this.http.post<Commonresponseobject>(environment[window['environmentType']].API_URL + apiEndPoint, requestPayload, this.httpOptions);
    }
  }

