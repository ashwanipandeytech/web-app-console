import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { environment } from 'environments/environment';
import { DataService } from 'shared-lib/services/data-service';
import { CustomEditorComponent } from 'custom-editor';

@Component({
  selector: 'app-editor-test',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CustomEditorComponent],
  templateUrl: './editor-test.html',
  styleUrl: './editor-test.scss',
})
export class EditorTestComponent {
  private fb = inject(FormBuilder);
  private dataService = inject(DataService);

  form = this.fb.group({
    content: [''],
  });

  handleImageUpload = async (file: File): Promise<string> => {
    if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
      throw new Error('Unsupported file type');
    }
    if (file.size > 1_000_000) {
      throw new Error('File size too large');
    }

    const formData = new FormData();
    formData.append('files', file);
    formData.append('type', 'product_image_description');

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
}
