import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Commonresponseobject } from '../model/responsemodel';
import { environment } from '../../../../../environments/environment';
import { MatSnackBar } from '@angular/material/snack-bar';
import { firstValueFrom, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  private http = inject(HttpClient);
  private snackBar = inject(MatSnackBar);
  private authToken: any;
  generalSetting:any;

  constructor() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    this.authToken = user?.token ?? '';
  }
  request(method: string, endpoint: string, data?: any, options: any = {}) {
    console.log('method===>',method);
      let httpOptions = {};
      let headers:any; 
        if (this.authToken !='' || !this.authToken) {
            headers = new HttpHeaders({
              'Authorization': `Bearer ${this.authToken}`
            });
        }
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const token = JSON.parse(localStorage.getItem('isNonUser') || 'null');
        if (endpoint === 'cart' && method == 'POST' && user.token == undefined) {
        httpOptions = {headers, observe: 'response' as const}
      }
        else{
          httpOptions = {headers}

        }
        if (token) {
        this.authToken = token;
        }
    console.log('this.authToken==>',this.authToken);
//     if (endpoint === 'cart' && user.token == undefined) {
//          let headers = new HttpHeaders({
//       'Authorization': `Bearer`
//     });
//        if (options.headers) {
//       headers = options.headers;
//     }
//     const httpOptions = { headers, observe: 'response' as const };
// return this.http
//   .post<Commonresponseobject>(`${environment.API_URL}${endpoint}`, data, httpOptions)
//   .pipe(
//     tap((res: any) => {
//       console.log("📩 Full Response:", res);
//       console.log("🧩 x-cart-identifier:", res.headers.get('x-cart-identifier'));
//       let nonLoggedInUserToken = res.headers.get('x-cart-identifier');
//       if (nonLoggedInUserToken) {
//        localStorage.setItem('isNonUser', JSON.stringify(nonLoggedInUserToken));
//       }
//       console.log("📬 Response Headers:", res.headers);

//       // console.log("🔐 Set-Cookie:", res.headers.get('set-cookie'));
//       // console.log("🧩 Custom Headers:", res.headers.keys());
//     })
//   );
//       // return this.http.post<Commonresponseobject>(`${environment.API_URL}${endpoint}`,data, httpOptions);
//     }

    //  headers = new HttpHeaders({
    //   'Authorization': `Bearer ${this.authToken}`
    // });
        if (options.headers) {
          headers = options.headers;
        }
        switch (method.toUpperCase()) {
    // observe: 'response' as const
          case 'GET':
            return this.http.get<Commonresponseobject>(`${environment.API_URL}${endpoint}`, httpOptions);

          case 'POST':
            return this.http.post<Commonresponseobject>(`${environment.API_URL}${endpoint}`, data, httpOptions);

          case 'PATCH':
            return this.http.patch<Commonresponseobject>(`${environment.API_URL}${endpoint}`, data, httpOptions);

          case 'PUT':
            return this.http.put<Commonresponseobject>(`${environment.API_URL}${endpoint}`, data, httpOptions);

          case 'DELETE':
            return this.http.delete<Commonresponseobject>(`${environment.API_URL}${endpoint}`, httpOptions);

          default:
            throw new Error(`Invalid HTTP Method: ${method}`);
        }
  }

  get(endpoint: string, from: string = '') {

    if (from === 'web') {
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${this.authToken}` });
      return this.http.get<Commonresponseobject>(`${environment.API_URL}${endpoint}`,{headers});
    }
    return this.request('GET', endpoint);
  }

  post(data: any, endpoint: string,) {
    return this.request('POST', endpoint, data);
  }

  postForm(endpoint: string, data: FormData) {
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${this.authToken}` });
    return this.request('POST', endpoint, data, { headers });
  }

  patch(endpoint: string, data: any, id: any) {
    return this.request('PATCH', `${endpoint}/${id}`, data);
  }
   put(data: any, endpoint: string) {
    return this.request('PUT', endpoint, data);
  }

  delete(endpoint: string, id: any) {
    return this.request('DELETE', `${endpoint}/${id}`);
  }

  getById(endpoint: string, id: any) {
    return this.request('GET', `${endpoint}/${id}`);
  }

  update(endpoint: string, data: any, id: any) {
    return this.request('POST', `${endpoint}/${id}`, data);
  }
  


	// Called by APP_INITIALIZER; returns a Promise that resolves when loaded
	loadGeneralSettings(endpoint:string): Promise<void> {
		// return firstValueFrom(this.http.get<Record<string, any>>(endpoint))
      	//return firstValueFrom(this.get(endpoint))
    	return firstValueFrom(this.get(endpoint))
			.then((data:any) => {
				// directly use the JSON from assets as the runtime env
				this.generalSetting = data.data.settings|| {};
				console.info('GeneralSettings loaded', this.generalSetting);
				//console.info('EnvService: environment loaded', this.generalSetting);
			})
			.catch(err => {
				// fallback to minimal env on error
			//	console.error('EnvService: failed to load environment from assets', err);
				this.generalSetting = {};
			});
	}

	// access a key with optional default
	getSpecificGeneralSettings<T = any>(key: string, defaultValue?: T): T | undefined {
		return (this.generalSetting && key in this.generalSetting) ? (this.generalSetting[key] as T) : defaultValue;
	}

	// return whole env object
	getAllGeneralSettings(): Record<string, any> {
		return this.generalSetting;
	}
}
