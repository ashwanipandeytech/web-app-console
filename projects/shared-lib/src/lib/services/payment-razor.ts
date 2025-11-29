import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';
declare var Razorpay: any;

@Injectable({
  providedIn: 'root'
})
export class RazorpayService {

  constructor(private http: HttpClient) { }

 
  openCheckout(amount: number) {
    const options = {
      key: environment.RAZORPAY_KEY_ID,  // Your Test Key
      amount: amount * 100,            // in paise
      currency: 'INR',
      name: 'Your App Name',
      description: 'Test Payment',
      image: 'https://your-logo.png',
      handler: (response: any) => {
        alert('Payment ID: ' + response.razorpay_payment_id);
        // Success! You can save this ID
      },
      prefill: {
        name: 'John Doe',
        email: 'john@example.com',
        contact: '9999999999'
      },
      theme: {
        color: '#3399cc'
      }
    };
  
    const rzp = new Razorpay(options);
    rzp.open();
  }
}