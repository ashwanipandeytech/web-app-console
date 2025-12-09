import { ModuleWithProviders, NgModule } from '@angular/core';
import { LoginComponent } from './login';
import { LOGIN_LIBRARY_CONFIG } from '../config/config-token';
import { LoginLibraryConfig } from '../config/config';
import { FormArray, FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { MatSnackBarModule } from '@angular/material/snack-bar';

export class LoginModule {
  static forRoot(config: LoginLibraryConfig): ModuleWithProviders<LoginModule> {
    return {
      ngModule: LoginModule,
      providers: [
        { provide: LOGIN_LIBRARY_CONFIG, useValue: config }
      ]
    };
  }
}
