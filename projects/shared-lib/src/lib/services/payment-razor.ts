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
      onpaymenterror: (error: any) => {
      console.log('Payment FAILED:', error);
      alert(`Payment Failed: ${error.description || 'Unknown error'}`);
      
      // Common error codes you can handle:
      // error.code, error.description, error.source, error.step, error.reason
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


}