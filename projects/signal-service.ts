import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SignalService {

  // signal to store counts
  allCounts = signal<any>(null);

  setCounts(data: any) {
    console.log('data==>',data);
    this.allCounts.set(data);
  }

  clearCartCounts() {
    this.allCounts.set(null);
  }
}
