
import { Component, Inject, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
@Component({
  selector: 'app-dynamicPopup',
  templateUrl: './confirmationPopup.component.html',
   imports: [ReactiveFormsModule, FormsModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatButtonModule],
  styleUrls: ['./confirmationPopup.component.scss'],
  standalone:true
})
export class DynamicPopup implements OnInit {

  constructor(
    private dialogRef: MatDialogRef<DynamicPopup>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    //console.log('popupData++++.',data);
    
   }

  ngOnInit() {
  }
 close() {
    this.dialogRef.close();
  }
closeWithData(data:any){
   this.dialogRef.close({action : data});
}
}
