import { inject, Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root',
})
export class GlobalService {
  snackBar = inject(MatSnackBar);
  constructor() {}

  showMsgSnackBar(response: any) {
    this.snackBar.open(response.message, 'OK', {
      duration: 2000,
      horizontalPosition: 'end',
      verticalPosition: 'bottom',
      panelClass: [response.success ? 'snackbar-success' : 'snackbar-error'],
    });
  }
}
