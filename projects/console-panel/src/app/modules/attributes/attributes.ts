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
  valueForm!: FormGroup;
  
  selectedAttribute: any = null;
  showAddValueForm = false;
  isLoading = false;

  ngOnInit() {
    this.initForms();
    this.loadAttributes();
  }

  initForms() {
    this.attributeForm = this.fb.group({
      name: ['', Validators.required],
      type: ['text', Validators.required]
    });

    this.valueForm = this.fb.group({
      value: ['', Validators.required],
      meta: [null]
    });
  }

  loadAttributes() {
    this.isLoading = true;
    this.dataService.get('attributes').subscribe((res: any) => {
      // Handle nested structure: res.data.data
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

  createAttribute() {
    if (this.attributeForm.invalid) return;

    this.dataService.post(this.attributeForm.value, 'attributes').subscribe((res: any) => {
      if (res.success) {
        this.globalService.showToast({ success: true, message: 'Attribute created successfully' });
        this.attributeForm.reset({ type: 'text' });
        this.loadAttributes();
      }
    });
  }

  selectAttribute(attr: any) {
    this.selectedAttribute = { ...attr, values: Array.isArray(attr.values) ? attr.values : [] };
    this.showAddValueForm = false;
  }

  addValue() {
    if (this.valueForm.invalid || !this.selectedAttribute) return;

    this.dataService.post(this.valueForm.value, `attributes/${this.selectedAttribute.id}/values`).subscribe((res: any) => {
      if (res.success) {
        this.globalService.showToast({ success: true, message: 'Value added successfully' });
        this.valueForm.reset();
        this.loadAttributes(); // Reload to get updated values
        // Update selectedAttribute reference with safe values array
        const updated = this.attributes.find(a => a.id === this.selectedAttribute.id);
        if (updated) {
          this.selectedAttribute = { ...updated, values: Array.isArray(updated.values) ? updated.values : [] };
        }
        this.cd.detectChanges();
      }
    });
  }

  deleteAttribute(id: number) {
    if (confirm('Are you sure you want to delete this attribute?')) {
      this.dataService.delete(`attributes/${id}`).subscribe((res: any) => {
        if (res.success) {
          this.globalService.showToast({ success: true, message: 'Attribute deleted' });
          if (this.selectedAttribute?.id === id) this.selectedAttribute = null;
          this.loadAttributes();
        }
      });
    }
  }
}
