import { Injectable } from '@angular/core';
 import { environment } from '../../../../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Commonresponseobject } from '../model/responsemodel';
@Injectable({
  providedIn: 'root'
})
export class DataService {
    //userid = JSON.parse(localStorage.getItem('user'))['ID'];
    constructor(public http: HttpClient) { 

      console.info('API CALL:', environment);
    }
    httpOptions = {
      headers: new HttpHeaders({
        'Authorization': environment.GLOBAL_AUTH,
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Accept': 'application/json'
  
      })
    };
  
    callApi(data: any, apiEndPoint: any) {
     
      const requestPayload = {
        application: environment.APPLICATION,
        version: environment.VERSION,
        data
      };
      const consolecolor = 'font-size:12px; font-weight: bold;padding:3px 2px;color:';
      // console.log('%c' + apiEndPoint + ':', consolecolor + 'green');
      // console.dir(apiEndPoint + ':' + JSON.stringify(requestPayload, null, 2));
      return this.http.post<Commonresponseobject>(environment.API_URL + apiEndPoint, data, this.httpOptions);
    }
  }

