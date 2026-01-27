import { CommonModule } from '@angular/common';
import { Component, inject, Input, OnInit } from '@angular/core';
import { SignalService } from '../../services/signal-service';
import { NgbActiveModal, NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { Login } from '../auth/login/login';

@Component({
  selector: 'app-no-data',
  templateUrl: './no-data.component.html',
  standalone: true,
  imports: [CommonModule],
  styleUrls: ['./no-data.component.scss'],
})
export class NoDataComponent implements OnInit {
  @Input() title: string = 'No Data Available';
  @Input() message: string = 'We couldn’t find any records to display at the moment.';
  @Input() showAction: boolean = false;
  @Input() actionText: string = 'Refresh';
  @Input() isLogin: any = false;
  private signalService = inject(SignalService);
  private ngbModal = inject(NgbModal);
  constructor() {}

  ngOnInit() {}

  openLogin() {
   const modalRef: NgbModalRef = this.ngbModal.open(Login, {
      windowClass: 'mobile-modal login-popup',
      scrollable: true,
      centered: true,
    });
    // modalRef.componentInstance.data = data;
  }
}
