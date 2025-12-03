
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'layout-settings',
  templateUrl: './layout-settings.component.html',
  imports: [ReactiveFormsModule, FormsModule],
  styleUrls: ['./layout-settings.component.scss'],
  standalone:true
})
export class LayoutSettingsComponent implements OnInit {
settings:any=FormGroup;
  constructor(private fb:FormBuilder) {
    this.addSettingForm();
   }

  ngOnInit() {
  }

  addSettingForm(){
      this.settings = this.fb.group({
      name: ['', [Validators.required]],
      mainCategory: ['',Validators.required],
      categoryThumbnail: [''],
      customCategoryIcon: [''],
      description: ['', [Validators.minLength(30)]],
      displayType: ['',Validators.required],

    });
  }
saveSettingData(){
  
}

}
