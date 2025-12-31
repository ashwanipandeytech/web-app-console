import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SignalService {
// user = signal<any>(null);
  // signal to store counts
  allCounts = signal<any>(null);
  userLoggedIn=signal<any>(false);
  currentLocation = signal<any>(null);

  setCounts(data: any) {
    this.allCounts.set(data);
  }

  clearCartCounts() {
    this.allCounts.set(null);
  }
  // setUser(user: any) {
  //   this.user.set(user);
  //   localStorage.setItem('user', JSON.stringify(user));
  // }

  // loadUserFromStorage() {
  //   const user = localStorage.getItem('user');
  //   if (user) {
  //     this.user.set(JSON.parse(user));
  //   }
  // }
}
