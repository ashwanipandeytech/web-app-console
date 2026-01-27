import { Injectable, Inject, PLATFORM_ID, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';
import { Observable, switchMap } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { DataService } from './data-service';

declare var Razorpay: any;
interface IntentResponse {
  success: boolean;
  data: {
    intent_id: string; // This is the Razorpay Order ID
    amount: number;
    currency: string;
    key: string;
    name: string;
  }
}
@Injectable({
  providedIn: 'root'
})

export class RazorpayService {
  isBrowser: boolean; // Add this
  private dataService = inject(DataService);
  constructor(private http: HttpClient, @Inject(PLATFORM_ID) private platformId: Object) { // Inject PLATFORM_ID
    this.isBrowser = isPlatformBrowser(this.platformId); // Initialize isBrowser
  }

 
  // openCheckout(payload: any) {
  //   const options = {
  //     key: environment.RAZORPAY_KEY_ID,  // Your Test Key
  //     amount: payload.amount * 100,            // in paise
  //     currency: 'INR',
  //     name: 'Your App Name',
  //     description: 'Test Payment',
  //     image: 'https://your-logo.png',
  //     handler: (response: any) => {
  //       alert('Payment ID: ' + response.razorpay_payment_id);
  //       // Success! You can save this ID
  //     },
  //     onpaymenterror: (error: any) => {
  //     console.log('Payment FAILED:', error);
  //     alert(`Payment Failed: ${error.description || 'Unknown error'}`);
      
  //     // Common error codes you can handle:
  //     // error.code, error.description, error.source, error.step, error.reason
  //   },
  //     prefill: {
  //       name: payload.name,
  //       email: payload.email,
  //       contact: payload.phone
  //     },
  //     theme: {
  //       color: '#3399cc'
  //     }
  //   };
  
  //   const rzp = new Razorpay(options);
  //   rzp.open();
  // }


  // Example: Node.js/Express
// app.post('/webhook/razorpay', express.raw({type: 'application/json'}), (req, res) => {
//   const signature = req.headers['x-razorpay-signature'];
//   const webhookSecret = 'your_webhook_secret';

//   const isValid = Razorpay.validateWebhookSignature(
//     req.body.toString(), 
//     signature, 
//     webhookSecret
//   );

//   if (!isValid) {
//     return res.status(400).send('Invalid signature');
//   }

//   const event = JSON.parse(req.body);

//   if (event.event === 'payment.captured') {
//     const paymentId = event.payload.payment.entity.id;
//     const orderId = event.payload.payment.entity.order_id;
//     const amount = event.payload.payment.entity.amount;

//     // THIS IS 100% CONFIRMED SUCCESS
//     console.log('Payment successful:', paymentId);
    
//     // Update your database, give access to user, etc.
//   }

//   res.status(200).send('OK');
// });
openCheckout1(payload: any): Observable<any> {
  return new Observable(observer => {
    if (this.isBrowser) {
      const options: any = {
        key: environment.RAZORPAY_KEY_ID,
        amount: payload.amount * 100,
        currency: 'INR',
        name: 'Safure',
        description: 'Test Payment',
        image: '/images/logos/logo.webp',

        handler: (response: any) => {
          // ✅ PAYMENT SUCCESS
          observer.next({
            success: true,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_signature: response.razorpay_signature
          });
          observer.complete();
        },

        prefill: {
          name: payload.name,
          email: payload.email,
          contact: payload.phone
        },

        theme: {
          color: '#3399cc'
        }
      };

      const rzp = new Razorpay(options);

      // ❌ remove onpaymenterror (not reliable)
      rzp.on('payment.failed', (error: any) => {
        observer.error({
          success: false,
          error
        });
      });

      rzp.open();
    } else {
      observer.error('Razorpay not available on server side');
    }
  });
}



// 2. Your updated method
openCheckout(internalOrderId: number, payload: any): Observable<any> {
  // First, call = Intent API
   
  // this.http.post<IntentResponse>('/api/v1/payments/create-intent', {
  //   order_id: internalOrderId,
  //   gateway: 'razorpay'
  // })
  return this.dataService.post({order_id: internalOrderId,gateway: 'razorpay'}, 'payments/create-intent')
  .pipe(
    switchMap(res => {
      return new Observable(observer => {
        if (!this.isBrowser) {
          observer.error('Not a browser');
          return;
        }

        const options: any = {
          key: res.data.key, // Use key from backend
          amount: res.data.amount * 100, // Razorpay expects paise (400 -> 40000)
          currency: res.data.currency,
          name: res.data.name,
          order_id: res.data.intent_id, // <--- THIS IS THE MAGIC LINK
          description: 'Payment for Order #' + internalOrderId,
          image: '/images/logos/logo.webp',
          
          handler: (response: any) => {
         
            // observer.next(response);
            // observer.complete();
             // ✅ PAYMENT SUCCESS
          observer.next({
            success: true,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_signature: response.razorpay_signature
          });
          observer.complete();
          },
          prefill: {
            name: payload.name,
            email: payload.email,
            contact: payload.phone
          },
          theme: { color: '#3399cc' },
          modal: {
            ondismiss: () => observer.error('Payment cancelled by user')
          }
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.open();
      });
    })
  );
}


}