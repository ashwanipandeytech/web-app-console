import { Provider } from '@angular/core';
import { LOGIN_LIBRARY_CONFIG } from './config-token';
import { LoginLibraryConfig } from './config';

export function provideLoginConfig(config: LoginLibraryConfig): Provider[] {
  return [
    { provide: LOGIN_LIBRARY_CONFIG, useValue: config }
  ];
}
