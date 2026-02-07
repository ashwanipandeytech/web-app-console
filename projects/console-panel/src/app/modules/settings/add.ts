
import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, of } from 'rxjs';
import { DataService } from 'shared-lib';
import { GlobalService } from '../../global.service';
import { CustomEditorComponent } from 'custom-editor';
import { firstValueFrom } from 'rxjs';
import { environment } from 'environments/environment';
@Component({
  selector: 'app-addpage',
  templateUrl: './add.html',
  imports: [FormsModule, CommonModule, CustomEditorComponent],
  styleUrls: ['./add.scss'],
  standalone:true
})
export class AddPage implements OnInit {
 public dataService: any = inject(DataService);
    private router: Router = inject(Router);
    private route: ActivatedRoute = inject(ActivatedRoute);
    private cdr = inject(ChangeDetectorRef);
    isEdit = false;
newPage:any=
  {
    
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
  constructor(private globalService:GlobalService) {
  
   }

  ngOnInit() {
    const slug = this.route.snapshot.queryParamMap.get('slug');
    if (slug) {
      this.isEdit = true;
      this.loadPage(slug);
    }
  }

  private loadPage(slug: string) {
    this.dataService.get('pages/' + slug)
      .pipe(
        catchError(err => {
          this.globalService.showMsgSnackBar(err);
          console.error('Error:', err);
          return of(null);
        })
      )
      .subscribe((res: any) => {
        if (res?.success && res?.data?.settings) {
          this.newPage = res.data.settings;
          this.cdr.detectChanges();
        }
      });
  }

  handleImageUpload = async (file: File): Promise<string> => {
    if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
      throw new Error('Unsupported file type');
    }
    if (file.size > 1_000_000) {
      throw new Error('File size too large');
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

 addPage(){
    let payload= {
          settings_name:this.newPage.slug,
          settings:this.newPage
        }
        this.dataService.post(payload, 'pages')
          .pipe(
            catchError(err => {
                this.globalService.showMsgSnackBar(err);
              console.error('Error:', err);
              return of(null);
            })
          )
          .subscribe((res: any) => {
            //console.log('Response:', res);
              this.globalService.showMsgSnackBar(res);
              this.router.navigate(['/pages']);
          
         
          });
}



}
