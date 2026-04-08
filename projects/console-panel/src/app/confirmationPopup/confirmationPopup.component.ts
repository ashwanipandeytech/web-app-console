
import { Component, inject, Input, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-confirmationPopup',
  templateUrl: './confirmationPopup.component.html',
  imports: [ReactiveFormsModule, FormsModule],
  styleUrls: ['./confirmationPopup.component.scss'],
  standalone: true,
})
export class ConfirmationPopupComponent implements OnInit {
  activeModal = inject(NgbActiveModal);
  @Input() data: any;

  constructor() {
    //// console.log('popupData++++.',data);
  }

  ngOnInit() {}

  close() {
    this.activeModal.dismiss();
  }

  deleteCategory(id: any) {
    this.activeModal.close({ action: 'delete', id: id });
  }
}
