import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  private http = inject(HttpClient);
  private snackBar = inject(MatSnackBar);
  private authToken: any;

  constructor() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    this.authToken = user?.token ?? '';
  }
  request(method: string, endpoint: string, data?: any, options: any = {}) {
    if (endpoint === 'cart') {
      return this.http.post<any>(`${environment.API_URL}${endpoint}`, data);
    }
    let headers = new HttpHeaders({
      'Authorization': `Bearer ${this.authToken}`
    });
    if (options.headers) {
      headers = options.headers;
    }
    const httpOptions = { headers };
    switch (method.toUpperCase()) {

      case 'GET':
        return this.http.get<any>(`${environment.API_URL}${endpoint}`, httpOptions);

      case 'POST':
        return this.http.post<any>(`${environment.API_URL}${endpoint}`, data, httpOptions);

      case 'PATCH':
        return this.http.patch<any>(`${environment.API_URL}${endpoint}`, data, httpOptions);

      case 'DELETE':
        return this.http.delete<any>(`${environment.API_URL}${endpoint}`, httpOptions);

      default:
        throw new Error(`Invalid HTTP Method: ${method}`);
    }
  }

  get(endpoint: string, from: string = '') {
    if (from === 'web') {
      return this.http.get<any>(`${environment.API_URL}${endpoint}`);
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

  delete(endpoint: string, id: any) {
    return this.request('DELETE', `${endpoint}/${id}`);
  }

  getById(endpoint: string, id: any) {
    return this.request('GET', `${endpoint}/${id}`);
  }

  update(endpoint: string, data: any, id: any) {
    return this.request('POST', `${endpoint}/${id}`, data);
  }
}
