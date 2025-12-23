import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SignalService {

  // signal to store counts
  allCounts = signal<any>(null);
  userLoggedIn=signal<any>(false) 

  setCounts(data: any) {
    console.log('data==>',data);
    this.allCounts.set(data);
  }

  clearCartCounts() {
    this.allCounts.set(null);
  }
}
