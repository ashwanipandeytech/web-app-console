import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { LOGIN_LIBRARY_CONFIG } from './config/config-token';


@Injectable({
  providedIn: 'root'
})
export class LoginService {
snackBar = inject(MatSnackBar);
loginCOnfig:any = inject(LOGIN_LIBRARY_CONFIG);
http = inject(HttpClient)
constructor() {

 }

//  commonFunction 
showMsgSnackBar(response:any){
    this.snackBar.open(response.message, 'OK', {
            duration: 3000,
           horizontalPosition: 'end',
           verticalPosition: 'top',
           panelClass: [response.success ? 'snackbar-success' : 'snackbar-error']
          });
}


// api functions start 

callApiNew(data: any, apiEndPoint: any) {
            const httpHeaders = new HttpHeaders({
          'Authorization': `Bearer ${this.loginCOnfig.authToken}`
        });
      const requestPayload = {
        application: this.loginCOnfig.APPLICATION,
        version: this.loginCOnfig.VERSION,
        data
      };
      return this.http.post(this.loginCOnfig.API_URL + apiEndPoint, data, { headers: httpHeaders });
    }
}