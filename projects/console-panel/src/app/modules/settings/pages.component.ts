
import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { catchError, of } from 'rxjs';
import { DataService } from 'shared-lib';
import { GlobalService } from '../../global.service';
import { environment } from 'environments/environment';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AddPage } from './add';

@Component({
  selector: 'app-pages',
  templateUrl: './pages.component.html',
  imports: [FormsModule, CommonModule],
  styleUrls: ['./pages.component.scss'],
  standalone: true
})
export class PageList implements OnInit {
  settings: any = FormGroup;
  public dataService: any = inject(DataService);
  private ngbModal = inject(NgbModal);
  pageList: any = [

  ]
  constructor(private router: Router, private cdr: ChangeDetectorRef,private globalService:GlobalService) {

  }

  ngOnInit() {
    this.dataService.get('pages/list')
      .pipe(
        catchError(err => {
          console.error('Error:', err);
          return of(null);
        })
      )
      .subscribe((res: any) => {
        //console.log('Response:', res);
        if (res.data) {
          this.pageList = res.data;
          this.cdr.detectChanges()
        }

      });

  }


  viewPage(page: any) {
    //console.log('View Page:', page);
    // open modal or navigate to detail page
  }

  editPage(page: any) {
    const dialogRef = this.ngbModal.open(AddPage, {
      size: 'xl',
      centered: true,
      backdrop: 'static'
    });
    dialogRef.componentInstance.data = { mode: 'edit', item: page, slug: page.slug };
    dialogRef.result.then((result) => {
      if (result === 'success') {
        this.ngOnInit();
      }
    }, () => {});
  }

  deletePage(index: number) {
    if (confirm('Are you sure you want to delete this page?')) {
     

       this.dataService.delete(`pages/${this.pageList[index].slug}`)
      .pipe(
        catchError(err => {
          console.error('Error:', err);
          return of(null);
        })
      )
      .subscribe((res: any) => {
        //console.log('Response:', res);
        if (res.success) {
         this.globalService.showToast(res);
          this.pageList.splice(index, 1);
          this.cdr.detectChanges()
        }

      });
    }
  }
  addPage() {
    const dialogRef = this.ngbModal.open(AddPage, {
      size: 'xl',
      centered: true,
      backdrop: 'static'
    });
    dialogRef.componentInstance.data = { mode: 'new' };
    dialogRef.result.then((result) => {
      if (result === 'success') {
        this.ngOnInit();
      }
    }, () => {});
  }

  getDescriptionPreview(value: any, maxLength: number = 120): string {
    const plainText = this.stripHtml(value);
    if (!plainText) {
      return '-';
    }

    if (plainText.length <= maxLength) {
      return plainText;
    }

    const cutAtSpace = plainText.lastIndexOf(' ', maxLength);
    const cutIndex = cutAtSpace > 0 ? cutAtSpace : maxLength;
    return `${plainText.slice(0, cutIndex).trim()}...`;
  }

  getDescriptionImage(value: any): string {
    const html = String(value ?? '');
    if (!html) return '';

    const match = html.match(/<img[^>]+src\s*=\s*['"]([^'"]+)['"][^>]*>/i);
    const rawSrc = match?.[1]?.trim() || '';
    if (!rawSrc) return '';

    return this.normalizeImageUrl(rawSrc);
  }

  private stripHtml(value: any): string {
    const text = String(value ?? '')
      .replace(/<[^>]*>/g, ' ')
      .replace(/&nbsp;/gi, ' ')
      .replace(/&amp;/gi, '&')
      .replace(/&lt;/gi, '<')
      .replace(/&gt;/gi, '>')
      .replace(/&quot;/gi, '"')
      .replace(/&#39;/gi, "'")
      .replace(/\s+/g, ' ')
      .trim();

    return text;
  }

  private normalizeImageUrl(raw: string): string {
    if (/^https?:\/\//i.test(raw)) {
      if (raw.startsWith('http://') && environment.DOMAIN.startsWith('https://')) {
        return raw.replace(/^http:\/\//i, 'https://');
      }
      return raw;
    }

    return `${environment.DOMAIN.replace(/\/$/, '')}/${raw.replace(/^\/+/, '')}`;
  }




}
