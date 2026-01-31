
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTreeModule } from '@angular/material/tree';
// import { QuillModule } from 'ngx-quill';

@Component({
  selector: 'app-category-tree',
  templateUrl: './category-tree.component.html',
  standalone:true,
   imports: [ReactiveFormsModule, FormsModule, MatButtonModule, MatIconModule],
  styleUrls: ['./category-tree.component.scss']
})
export class CategoryTreeComponent implements OnInit {
  @Input() categoriesData:any = {};
 @Input() selectedIds: number[] = [];   // shared between recursive component calls
@Output() selectedId = new EventEmitter<number>();
  onCheckboxChange(cat: any) {
    if (cat.checked) {
      this.addId(cat.id);
    } else {
      this.removeId(cat.id);
    }

    //console.log("Selected IDs:", this.selectedIds);
  }

  // Add an ID once
  addId(id: number) {
    if (!this.selectedIds.includes(id)) {
      this.selectedIds.push(id);
      this.selectedId.emit(this.selectedIds[0]);
    }
  }

  // Remove ID and also remove children IDs
  removeId(id: number) {
    this.selectedIds = this.selectedIds.filter(x => x !== id);

    // Remove all children's IDs recursively
    const removeChildren = (children: any[]) => {
      children.forEach(child => {
        this.selectedIds = this.selectedIds.filter(x => x !== child.id);
        if (child.children?.length) removeChildren(child.children);
      });
    };

    // Find the selected category in the tree and remove all child ids
    removeChildren(this.findCategoryById(id)?.children || []);
  }

  // Helper: find category inside nested tree
  findCategoryById(id: number, nodes = this.categoriesData.categories): any {
    for (let c of nodes) {
      if (c.id === id) return c;
      if (c.children?.length) {
        const found = this.findCategoryById(id, c.children);
        if (found) return found;
      }
    }
    return null;
  }
  toggle(cat: any) {
    cat.checked = !cat.checked;
  }
  constructor() { }

  ngOnInit() {
    console.log('categoriesData==/',this.categoriesData);
    
  }

}
