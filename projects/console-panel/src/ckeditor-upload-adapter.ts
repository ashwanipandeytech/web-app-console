import { DataService } from 'shared-lib/services/data-service';
import { firstValueFrom } from 'rxjs';

export class MyUploadAdapter {
  private loader: any;
  private dataService: DataService;

  constructor(loader: any, dataService: DataService) {
    this.loader = loader;
    this.dataService = dataService;
  }

  async upload(): Promise<{ default: string }> {
    const file: File = await this.loader.file;

    // ✅ Type validation
    if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
      return Promise.reject('Unsupported file type');
    }

    // ✅ Size validation (1 MB)
    if (file.size > 1_000_000) {
      return Promise.reject('File size too large');
    }

    const formData = new FormData();
    formData.append('files', file);
    formData.append('type', 'product_image_description');

    try {
      const res: any = await firstValueFrom(
        this.dataService.postForm('gallery', formData)
      );

      const imageUrl = res?.data?.[0]?.url;
      if (!imageUrl) {
        return Promise.reject('Upload failed');
      }

      // 🔑 CKEditor requires { default: url }
      return {
        default: imageUrl
      };
    } catch (error) {
      return Promise.reject(error);
    }
  }

  abort() {
    // Optional: cancel upload
  }
}
