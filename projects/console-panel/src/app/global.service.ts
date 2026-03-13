import { inject, Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root',
})
export class GlobalService {
  toastr = inject(ToastrService);
  constructor() {}

  showToast(response: any) {
    if (response.success) {
      this.toastr.success(response.message);
    } else {
      this.toastr.error(response.message || 'Something went wrong');
    }
  }
}
