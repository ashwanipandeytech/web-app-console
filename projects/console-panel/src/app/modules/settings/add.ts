import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject, OnInit, ViewChild, TemplateRef, Input, Optional } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, of } from 'rxjs';
import { DataService } from 'shared-lib';
import { GlobalService } from '../../global.service';
import { CustomEditorComponent } from 'custom-editor';
import { firstValueFrom } from 'rxjs';
import { environment } from 'environments/environment';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ElementorEditor } from '../products/add-product/elementor-editor/elementor-editor';
import { SpecialCharacterHelper } from 'shared-lib/services/special-character-helper';

@Component({
  selector: 'app-addpage',
  templateUrl: './add.html',
  imports: [FormsModule, CommonModule, CustomEditorComponent, ElementorEditor],
  styleUrls: ['./add.scss'],
  standalone:true
})
export class AddPage implements OnInit {
  public dataService: any = inject(DataService);
  private router: Router = inject(Router);
  private route: ActivatedRoute = inject(ActivatedRoute);
  private cdr = inject(ChangeDetectorRef);
  private modalService = inject(NgbModal);
  private sanitizer = inject(DomSanitizer);
  private specialCharacterHelper = inject(SpecialCharacterHelper);

  @Input() data: any;

  isEdit = false;
  elementorMode = {
    description: false,
    pageContent: false
  };
  
  currentEditingField: 'description' | 'pageContent' | null = null;
  tempElementorValue = '';
  
  newPage:any= {
    "title":"",
    "description":"",
    "slug":"",
    "pageContent":"",
    "seoData":{
      "keywords":"",
      "metaTitle":"",
      "metaDescription":""
    }
  }

  constructor(
    private globalService: GlobalService,
    @Optional() public activeModal: NgbActiveModal
  ) { }

  ngOnInit() {
    if (this.data) {
      if (this.data.mode === 'edit') {
        this.isEdit = true;
        if (this.data.slug) {
          this.loadPage(this.data.slug);
        } else if (this.data.item) {
          this.newPage = { ...this.data.item };
          this.detectElementorMode();
        }
      }
    } else {
      const slug = this.route.snapshot.queryParamMap.get('slug');
      if (slug) {
        this.isEdit = true;
        this.loadPage(slug);
      }
    }
  }

  private detectElementorMode() {
    const isElementor = (val: string) => val?.includes('<!-- ELEMENTOR_BLOCKS:') || val?.includes('elementor-content-wrapper');
    if (isElementor(this.newPage.description)) this.elementorMode.description = true;
    if (isElementor(this.newPage.pageContent)) this.elementorMode.pageContent = true;
  }

  getSafeHtml(html: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(html || '');
  }

  onSlugChange() {
    if (this.newPage.slug) {
      this.newPage.slug = this.newPage.slug
        .toLowerCase()
        .replace(/\s+/g, '-')           // Replace spaces with -
        .replace(/[^a-z0-9-]/g, '')     // Remove all non-alphanumeric except -
        .replace(/-+/g, '-')            // Replace multiple - with single -
        .replace(/^-+|-+$/g, '');       // Trim - from start and end
    }
  }

  createSlugFromTitle() {
    if (!this.isEdit && this.newPage.title) {
      this.newPage.slug = this.newPage.title
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '')
        .replace(/-+/g, '-')
        .replace(/^-+|-+$/g, '');
    }
  }

  private loadPage(slug: string) {
    this.dataService.get('pages/' + slug)
      .pipe(
        catchError(err => {
          this.globalService.showToast(err);
          console.error('Error:', err);
          return of(null);
        })
      )
      .subscribe((res: any) => {
        if (res?.success && res?.data?.settings) {
          this.newPage = res.data.settings;
          this.detectElementorMode();
          this.cdr.detectChanges();
        }
      });
  }

  openVisualEditor(field: 'description' | 'pageContent', modalTemplate: any) {
    this.currentEditingField = field;
    this.tempElementorValue = this.newPage[field] || '';
    
    this.modalService.open(modalTemplate, {
      size: 'xl',
      centered: true,
      scrollable: true,
      backdrop: 'static'
    }).result.then((result) => {
      if (result === 'save' && this.currentEditingField) {
        this.elementorMode[this.currentEditingField] = true;
        this.newPage[this.currentEditingField] = this.tempElementorValue;
      }
      this.cdr.detectChanges();
    }, () => {
      this.cdr.detectChanges();
    });
  }

  handleImageUpload = async (file: File): Promise<string> => {
    if (!['image/jpeg', 'image/png', 'image/jpg', 'image/webp'].includes(file.type)) {
      throw new Error('Unsupported file type');
    }
    
    const formData = new FormData();
    formData.append('files', file);
    formData.append('type', 'pages');

    const extractUrl = (res: any): string | undefined =>
      res?.data?.[0]?.url ||
      res?.data?.data?.[0]?.url ||
      res?.data?.url ||
      res?.data?.data?.url ||
      res?.url ||
      res?.data?.path ||
      res?.data?.[0]?.path ||
      res?.data?.data?.[0]?.path;

    const normalizeUrl = (raw: string) => {
      if (/^https?:\/\//i.test(raw)) {
        if (raw.startsWith('http://') && environment.DOMAIN.startsWith('https://')) {
          return raw.replace(/^http:\/\//i, 'https://');
        }
        return raw;
      }
      return `${environment.DOMAIN.replace(/\/$/, '')}/${raw.replace(/^\//, '')}`;
    };

    let lastResponse: any = null;
    const tryUpload = async (endpoint: string) => {
      const res: any = await firstValueFrom(this.dataService.postForm(endpoint, formData));
      lastResponse = res;
      return extractUrl(res);
    };

    let imageUrl: string | undefined;
    try {
      imageUrl = await tryUpload('gallery');
    } catch {
      imageUrl = undefined;
    }

    if (!imageUrl) {
      try {
        imageUrl = await tryUpload('media/upload');
      } catch {
        imageUrl = undefined;
      }
    }

    if (!imageUrl) {
      console.error('Image upload failed: no URL returned', lastResponse);
      throw new Error('Upload failed');
    }

    return normalizeUrl(imageUrl);
  };

  addPage() {
    let payload= {
      settings_name:this.newPage.slug,
      settings:this.newPage
    }
    
    this.dataService.post(payload, 'pages')
      .pipe(
        catchError(err => {
          this.globalService.showToast(err);
          console.error('Error:', err);
          return of(null);
        })
      )
      .subscribe((res: any) => {
        if (res?.success) {
          this.globalService.showToast(res);
          if (this.activeModal) {
            this.activeModal.close('success');
          } else {
            this.router.navigate(['/pages']);
          }
        }
      });
  }

  closeModal() {
    if (this.activeModal) {
      this.activeModal.dismiss();
    } else {
      this.router.navigate(['/pages']);
    }
  }
}
