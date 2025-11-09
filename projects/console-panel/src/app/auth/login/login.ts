import { HttpClientModule } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
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
  callLogin() {

    const loginData = {
      email: 'superadmin@demohandler.com',
      password: 'R9!hQ7k$2Pm@A1eZx4LwT8uV#cN0sBf'
    };
    this.dataService.callApi(loginData, 'login').subscribe((response:any) => {
      console.log('Login Response:', response);
    });
  }

}
