import { inject, Injectable } from '@angular/core';
 import { environment } from '../../../../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Commonresponseobject } from '../model/responsemodel';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  snackBar = inject(MatSnackBar);
  authToken:any;
    //userid = JSON.parse(localStorage.getItem('user'))['ID'];
    constructor(public http: HttpClient) { 

      console.info('API CALL:', environment);
        // Get user from localStorage
        const userString = localStorage.getItem('user');
        const user = userString ? JSON.parse(userString) : null;

        console.log("User:", user);

        // Check token
        this.authToken = user?.token ?? '';
    }
    httpOptions = {
      headers: new HttpHeaders({
        'Authorization': environment.GLOBAL_AUTH,
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Accept': 'application/json'
  
      })
    };

    // website
  
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

    // console-admin 
   callApiNew(data: any, apiEndPoint: any) {
            const httpHeaders = new HttpHeaders({
          'Authorization': `Bearer ${this.authToken}`
        });
      const requestPayload = {
        application: environment.APPLICATION,
        version: environment.VERSION,
        data
      };
      return this.http.post<Commonresponseobject>(environment.API_URL + apiEndPoint, data, { headers: httpHeaders });
    }

      callApiWithFormData(data: any, apiEndPoint: string) {
        const httpHeaders = new HttpHeaders({
          'Authorization': `Bearer ${this.authToken}`
        });
      console.log('httpHeaders==>',httpHeaders);
        return this.http.post(environment.API_URL + apiEndPoint,data,{ headers: httpHeaders });
      }


      callGetApi(apiEndPoint: any,from:any='') {
        console.log(from);
        
        if (from !='web') {
          console.log('enter');
          
          const httpHeaders = new HttpHeaders({
          'Authorization': `Bearer ${this.authToken}`
        });
        return this.http.get<Commonresponseobject>(environment.API_URL + apiEndPoint,{headers:httpHeaders});
        }
        else{
        return this.http.get<Commonresponseobject>(environment.API_URL + apiEndPoint);
        }
    }
    callDeleteApi(apiEndPoint:any,id:any){
          const httpHeaders = new HttpHeaders({
          'Authorization': `Bearer ${this.authToken}`
        });
      return this.http.delete<Commonresponseobject>(environment.API_URL + apiEndPoint + '/' + id, {headers:httpHeaders});
    }
    callGetById(apiEndPoint: string, id: string | number) {
  const httpHeaders = new HttpHeaders({
    Authorization: `Bearer ${this.authToken}`
  });

  return this.http.get<Commonresponseobject>(
    `${environment.API_URL}${apiEndPoint}/${id}`,
    { headers: httpHeaders }
  );
}
    callUpdateApi(apiEndPoint: any,data: any,id:any){

  const httpHeaders = new HttpHeaders({
          'Authorization': `Bearer ${this.authToken}`
        });
      console.log('httpHeaders==>',httpHeaders);
        return this.http.post(environment.API_URL + apiEndPoint + '/' + id,data,{ headers: httpHeaders });



       const requestPayload = {
        application: environment.APPLICATION,
        version: environment.VERSION,
        data
      };
      return this.http.post<Commonresponseobject>(environment.API_URL + apiEndPoint + '/' + id, data, this.httpOptions);
      // const httpHeaders = new HttpHeaders({
      //     'Authorization': `Bearer ${this.authToken}`
      //   });
      // console.log('httpHeaders==>',httpHeaders);
      //   return this.http.post(environment.API_URL + apiEndPoint + '/' + data.id,data,{ headers: httpHeaders });
    }
  }

