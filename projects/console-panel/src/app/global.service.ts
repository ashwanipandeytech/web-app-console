import { inject, Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class GlobalService {
snackBar = inject(MatSnackBar);
constructor() { }


showMsgSnackBar(response:any){
    this.snackBar.open(response.message, 'OK', {
            duration: 3000,
           panelClass: [response.success ? 'snackbar-success' : 'snackbar-error']
          });
}
}
