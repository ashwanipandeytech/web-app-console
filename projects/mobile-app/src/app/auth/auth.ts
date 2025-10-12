import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-auth',
  imports: [ CommonModule ],
  templateUrl: './auth.html',
  styleUrl: './auth.scss'
})
export class Auth {
  isSignUp: Boolean=true;
  forgotPassword: Boolean=false;
  constructor(private router: Router){}

  login() {
    this.router.navigate(['/home']);
  }
}
