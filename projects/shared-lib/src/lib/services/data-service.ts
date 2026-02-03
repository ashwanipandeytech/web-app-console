import { Inject, inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Commonresponseobject } from '../model/responsemodel';
import { environment } from '../../../../../environments/environment';
import { MatSnackBar } from '@angular/material/snack-bar';
import { firstValueFrom, of } from 'rxjs';
import { Meta } from '@angular/platform-browser';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  private http = inject(HttpClient);
  private snackBar = inject(MatSnackBar);
  private platformId = inject(PLATFORM_ID);
  private meta = inject(Meta);

  private authToken: any;
  generalSetting: any;
  private isBrowser: boolean;
  constructor() {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }
  request(method: string, endpoint: string, postdata?: any, options: any = {}) {
    let data: any = postdata;
    let user: any = {};
    let guestToken: any = {};

    if (this.isBrowser) {
      user = JSON.parse(localStorage.getItem('user') || '{}');
      guestToken = JSON.parse(localStorage.getItem('GUEST_TOKEN') || '{}');
    }
    let headers: any;
    let httpOptions = {};
    if (user?.token) {
      this.authToken = user?.token;
       console.info('endpoint')
      headers = new HttpHeaders({
        Authorization: `Bearer ${this.authToken}`,
      });
      httpOptions = { headers };
    } else {
      this.authToken = guestToken;
     
      if (endpoint == 'social/consume') {

        headers = new HttpHeaders({
           Authorization: `Bearer ${this.authToken}`,
          'X-Social-Login-Key': data['X-Social-Login-Key']
        });
        httpOptions = { headers };
      } else {
        endpoint = `${endpoint}?guest_token=${guestToken}`;
        httpOptions = {};
      }
      // data.guest_token = guestToken;

    }
    //console.log('httpOptions===>',httpOptions);
    let commonurl = 'https://api.demohandler.in/api/v1/';
    switch (method.toUpperCase()) {
      case 'GET':
        return this.http.get<Commonresponseobject>(
          `${environment.API_URL}${endpoint}`,
          httpOptions
        );

      case 'POST':
        return this.http.post<Commonresponseobject>(
          `${environment.API_URL}${endpoint}`,
          data,
          httpOptions
        );

      case 'POST_COMMON':
        return this.http.post<Commonresponseobject>(`${commonurl}${endpoint}`, data, httpOptions);
      case 'PATCH':
        return this.http.patch<Commonresponseobject>(
          `${environment.API_URL}${endpoint}`,
          data,
          httpOptions
        );

      case 'PUT':
        return this.http.put<Commonresponseobject>(
          `${environment.API_URL}${endpoint}`,
          data,
          httpOptions
        );

      case 'DELETE':
        return this.http.delete<Commonresponseobject>(
          `${environment.API_URL}${endpoint}`,
          httpOptions
        );

      default:
        throw new Error(`Invalid HTTP Method: ${method}`);
    }
  }

  get(endpoint: string, from: string = '') {
    if (from === 'web') {
      const headers = new HttpHeaders({ Authorization: `Bearer ${this.authToken}` });
      return this.http.get<Commonresponseobject>(`${environment.API_URL}${endpoint}`, { headers });
    }
    return this.request('GET', endpoint);
  }

  post(data: any, endpoint: string) {
    let finalData = data;
    return this.request('POST', endpoint, data);
  }

  postForm(endpoint: string, data: FormData) {
    const headers = new HttpHeaders({ Authorization: `Bearer ${this.authToken}` });
    return this.request('POST', endpoint, data, { headers });
  }

  patch(endpoint: string, data: any) {
    return this.request('PATCH', `${endpoint}`, data);
  }
  put(data: any, endpoint: string) {
    return this.request('PUT', endpoint, data);
  }

  delete(endpoint: string) {
    return this.request('DELETE', `${endpoint}`);
  }

  getById(endpoint: string, id: any) {
    return this.request('GET', `${endpoint}/${id}`);
  }

  update(endpoint: string, data: any, id: any) {
    return this.request('POST', `${endpoint}/${id}`, data);
  }
  postCommonApi(data: any, endpoint: string) {
    return this.request('POST_COMMON', endpoint, data);
  }

  // Called by APP_INITIALIZER; returns a Promise that resolves when loaded
  loadGeneralSettings(endpoint: string): Promise<void> {
    // return firstValueFrom(this.http.get<Record<string, any>>(endpoint))
    //return firstValueFrom(this.get(endpoint))
    return firstValueFrom(this.get(endpoint))
      .then((data: any) => {
        // directly use the JSON from assets as the runtime env
        this.generalSetting = data.data.settings || {};
        console.info('testing ssr', this.generalSetting);
           this.meta.addTags([
    { keyword: this.generalSetting.seoData.keywords, content: this.generalSetting.seoData.metaDescription,title:this.generalSetting.seoData.metaTitle },
    // ...
  ]);
        //console.info('EnvService: environment loaded', this.generalSetting);
      })
      .catch((err) => {
        // fallback to minimal env on error
        //	console.error('EnvService: failed to load environment from assets', err);
        this.generalSetting = {};
      });
  }

  // access a key with optional default
  getSpecificGeneralSettings<T = any>(key: string, defaultValue?: T): T | undefined {
    return this.generalSetting && key in this.generalSetting
      ? (this.generalSetting[key] as T)
      : defaultValue;
  }

  // return whole env object
  getAllGeneralSettings(): Record<string, any> {
    return this.generalSetting;
  }
}
