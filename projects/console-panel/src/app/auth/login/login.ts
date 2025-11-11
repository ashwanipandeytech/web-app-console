import { HttpClientModule } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { DataService } from 'shared-lib';

@Component({
  selector: 'app-login',
  imports: [HttpClientModule],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login {

  public dataService:any= inject(DataService);
  private activatedRoute= inject(ActivatedRoute);
  public router=inject(Router)
 //add toastr library private activatedRoute= inject(ActivatedRoute);
  email:any='superadmin@demohandler.com'
  password:any='R9!hQ7k$2Pm@A1eZx4LwT8uV#cN0sBf'
  callLogin() {

    const loginData = {
      email: this.email,
      password: this.password
    };

    
    this.dataService.callApi(loginData, 'login').pipe(
      catchError((error) => {
        console.error('Error occurred during login:', error);
       //add toaserfnc alert('Login failed: ' + response.message);
        // Optionally, you can return an observable to prevent further execution
        return of(null); // or you can return a default value if needed
      })
    ).subscribe((response: any) => {
      console.log('Login Response:', response);
    
      if (response && response.success) {
        localStorage.setItem('user', JSON.stringify(response.data));
        this.router.navigate(['dashboard']);
      } else if (response) {
       //add toaserfnc alert('Login failed: ' + response.message);
      }
    });
    
  }

}
