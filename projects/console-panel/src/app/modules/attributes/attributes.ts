import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DataService } from 'shared-lib';
import { catchError, of } from 'rxjs';
import { GlobalService } from '../../global.service';

@Component({
  selector: 'app-attributes',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './attributes.html',
  styleUrl: './attributes.scss'
})
export class Attributes implements OnInit {
 public dataService:any= inject(DataService);
  private fb: FormBuilder = inject(FormBuilder);
  private cd: ChangeDetectorRef = inject(ChangeDetectorRef);
  private globalService: GlobalService = inject(GlobalService);

  attributes: any[] = [];
  attributeForm!: FormGroup;
  
  selectedAttribute: any = null;
  isEditMode = false;
  isLoading = false;
  
  // Local list of values for the current attribute being created/edited
  attributeValues: any[] = [];
  newValue = { value: '', meta: '' };

  ngOnInit() {
    this.initForms();
    this.loadAttributes();
  }

  initForms() {
    this.attributeForm = this.fb.group({
      name: ['', Validators.required],
      type: ['text', Validators.required]
    });
  }

  loadAttributes() {
    this.isLoading = true;
    this.dataService.get('attributes').subscribe((res: any) => {
      if (res.data && Array.isArray(res.data.data)) {
        this.attributes = res.data.data;
      } else if (Array.isArray(res.data)) {
        this.attributes = res.data;
      } else if (Array.isArray(res)) {
        this.attributes = res;
      } else {
        this.attributes = [];
      }
      
      this.isLoading = false;
      this.cd.detectChanges();
    });
  }

  resetForm() {
    this.isEditMode = false;
    this.selectedAttribute = null;
    this.attributeForm.reset({ type: 'text' });
    this.attributeValues = [];
    this.newValue = { value: '', meta: '' };
  }

  addValueToLocalList() {
    if (!this.newValue.value.trim()) return;
    
    this.attributeValues.push({
      value: this.newValue.value,
      meta: this.newValue.meta || null
    });
    
    this.newValue = { value: '', meta: '' };
  }

  removeValueFromLocalList(index: number) {
    this.attributeValues.splice(index, 1);
  }

  saveAttribute() {
    if (this.attributeForm.invalid) return;

    const payload = {
      ...this.attributeForm.value,
      values: this.attributeValues
    };

    if (this.isEditMode && this.selectedAttribute) {
      this.dataService.put(payload, `attributes/${this.selectedAttribute.id}`).subscribe((res: any) => {
        if (res.success) {
          this.globalService.showToast({ success: true, message: 'Attribute updated successfully' });
          this.resetForm();
          this.loadAttributes();
        }
      });
    } else {
      this.dataService.post(payload, 'attributes').subscribe((res: any) => {
        if (res.success) {
          this.globalService.showToast({ success: true, message: 'Attribute created successfully' });
          this.resetForm();
          this.loadAttributes();
        }
      });
    }
  }

  editAttribute(attr: any) {
    this.isEditMode = true;
    this.selectedAttribute = attr;
    this.attributeForm.patchValue({
      name: attr.name,
      type: attr.type
    });
    // For edit mode, we keep the existing IDs
    this.attributeValues = Array.isArray(attr.values) ? attr.values.map((v: any) => ({
      id: v.id,
      value: v.value,
      meta: v.meta
    })) : [];
  }

  deleteAttribute(id: number) {
    if (confirm('Are you sure you want to delete this attribute?')) {
      this.dataService.delete(`attributes/${id}`).subscribe((res: any) => {
        if (res.success) {
          this.globalService.showToast({ success: true, message: 'Attribute deleted' });
          if (this.selectedAttribute?.id === id) this.resetForm();
          this.loadAttributes();
        }
      });
    }
  }
}
