import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, EventEmitter, forwardRef, inject, Input, Output, OnChanges, SimpleChanges } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { firstValueFrom } from 'rxjs';
import {
  Alignment,
  Autoformat,
  AutoImage,
  AutoLink,
  Autosave,
  BlockQuote,
  Bold,
  Bookmark,
  Code,
  Essentials,
  FindAndReplace,
  FontBackgroundColor,
  FontColor,
  FontFamily,
  FontSize,
  GeneralHtmlSupport,
  Heading,
  Highlight,
  HorizontalLine,
  ImageBlock,
  ImageCaption,
  ImageEditing,
  ImageInline,
  ImageInsert,
  ImageInsertViaUrl,
  ImageResize,
  ImageStyle,
  ImageTextAlternative,
  ImageToolbar,
  ImageUpload,
  ImageUtils,
  Indent,
  IndentBlock,
  Italic,
  Link,
  LinkImage,
  List,
  ListProperties,
  Mention,
  Paragraph,
  PasteFromOffice,
  PictureEditing,
  RemoveFormat,
  SourceEditing,
  SpecialCharacters,
  SpecialCharactersArrows,
  SpecialCharactersCurrency,
  SpecialCharactersEssentials,
  SpecialCharactersLatin,
  SpecialCharactersMathematical,
  SpecialCharactersText,
  Strikethrough,
  Subscript,
  Superscript,
  Table,
  TableCaption,
  TableCellProperties,
  TableColumnResize,
  TableProperties,
  TableToolbar,
  TextTransformation,
  TodoList,
  Underline,
  type EditorConfig,
  ClassicEditor
} from 'ckeditor5';

type UploadAdapterFactory = (loader: any) => {
  upload: () => Promise<{ default: string }>;
  abort?: () => void;
};

@Component({
  selector: 'ce-custom-editor',
  standalone: true,
  imports: [CommonModule, CKEditorModule],
  template: `
    <ckeditor
      [editor]="Editor"
      [config]="mergedConfig"
      [disabled]="disabled"
      (ready)="onReady($event)"
      (change)="onEditorChange($event)"
      (blur)="markTouched()"
    />
  `,
  styles: [
    `
      :host ::ng-deep .ck-editor__editable {
        min-height: 180px;
      }
      :host ::ng-deep .ck.ck-editor {
        width: 100%;
      }
    `,
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CustomEditorComponent),
      multi: true,
    },
  ],
})
export class CustomEditorComponent implements ControlValueAccessor, OnChanges {
  private http = inject(HttpClient);

  @Input() config: EditorConfig = {};
  @Input() placeholder = 'Type or paste your content here...';
  @Input() disabled = false;
  @Input() licenseKey = 'GPL';

  @Input() uploadUrl?: string;
  @Input() uploadHeaders: Record<string, string> = {};
  @Input() uploadFieldName = 'files';
  @Input() uploadResponsePath = 'data[0].url';
  @Input() uploadExtraFields: Record<string, string> = {};
  @Input() uploadAdapterFactory?: UploadAdapterFactory;
  @Input() uploadFn?: (file: File) => Promise<string> | string;

  @Output() valueChange = new EventEmitter<string>();

  public Editor = ClassicEditor;
  public mergedConfig: EditorConfig = {};

  value = '';
  private pendingValue: string | null = null;
  private lastEmittedValue: string | null = null;
  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};
  private editorInstance: any;

  constructor() {
    this.mergedConfig = this.buildConfig(this.config);
  }

  writeValue(value: string | null): void {
    const next = value ?? '';
    this.value = next;
    if (!this.editorInstance) {
      this.pendingValue = next;
      return;
    }
    const current = this.editorInstance.getData?.() ?? '';
    if (current !== next && this.lastEmittedValue !== next) {
      this.editorInstance.setData(next);
    }
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['config'] || changes['placeholder'] || changes['licenseKey']) {
      this.mergedConfig = this.buildConfig(this.config);
    }
  }

  markTouched(): void {
    this.onTouched();
  }

  onEditorChange(event: any): void {
    const editor = event?.editor;
    if (!editor) {
      return;
    }
    const data = editor.getData() ?? '';
    this.value = data;
    this.lastEmittedValue = data;
    this.onChange(data);
    this.valueChange.emit(data);
  }

  onReady(editor: any): void {
    this.editorInstance = editor;
    const fileRepository = editor.plugins.get('FileRepository');
    fileRepository.createUploadAdapter = (loader: any) => this.createUploadAdapter(loader);
    if (this.pendingValue !== null) {
      const pending = this.pendingValue;
      this.pendingValue = null;
      if (editor.getData() !== pending) {
        editor.setData(pending);
      }
    }
  }

  private createUploadAdapter(loader: any) {
    if (this.uploadAdapterFactory) {
      return this.uploadAdapterFactory(loader);
    }

    if (this.uploadFn) {
      return {
        upload: async () => {
          try {
            const file = await loader.file;
            const url = await this.uploadFn!(file);
            if (!url) {
              throw new Error('Upload returned empty URL');
            }
            const finalUrl = await this.ensureImageVisible(url, file);
            console.info('CustomEditor upload URL:', finalUrl);
            this.ensureImageInserted(finalUrl);
            return { default: finalUrl };
          } catch (err) {
            console.error('CustomEditor upload failed', err);
            throw err;
          }
        },
      };
    }

    if (!this.uploadUrl) {
      return {
        upload: async () => Promise.reject('No upload handler configured'),
      };
    }

    return {
      upload: async () => {
        const file: File = await loader.file;
        const formData = new FormData();
        formData.append(this.uploadFieldName, file);
        for (const [key, value] of Object.entries(this.uploadExtraFields)) {
          formData.append(key, value);
        }

        const headers = new HttpHeaders(this.uploadHeaders || {});
        const response = await firstValueFrom(this.http.post(this.uploadUrl!, formData, { headers }));
        const imageUrl = this.getValueByPath(response as any, this.uploadResponsePath) as string | undefined;
        if (!imageUrl) {
          return Promise.reject('Upload failed: response did not include image URL');
        }
        const finalUrl = await this.ensureImageVisible(imageUrl, file);
        this.ensureImageInserted(finalUrl);
        return { default: finalUrl };
      },
    };
  }

  private buildConfig(userConfig: EditorConfig): EditorConfig {
    const baseConfig: EditorConfig = {
      toolbar: {
        items: [
          'undo',
          'redo',
          '|',
          'sourceEditing',
          'link',
          'insertImage',
          'insertTable',
          '|',
          'heading',
          '|',
          'fontSize',
          'fontFamily',
          'fontColor',
          'fontBackgroundColor',
          '|',
          'bold',
          'italic',
          'underline',
          'strikethrough',
          'subscript',
          'superscript',
          '|',
          'blockQuote',
          'alignment',
          'horizontalLine',
          '|',
          'bulletedList',
          'numberedList',
          'todoList',
          '|',
          'outdent',
          'indent',
          '|',
          'removeFormat',
          'specialCharacters',
          'findAndReplace',
        ],
        shouldNotGroupWhenFull: false,
      },
      plugins: [
        SourceEditing,
        Alignment,
        Autoformat,
        AutoImage,
        AutoLink,
        Autosave,
        BlockQuote,
        Bold,
        Bookmark,
        Code,
        Essentials,
        FindAndReplace,
        FontBackgroundColor,
        FontColor,
        FontFamily,
        FontSize,
        GeneralHtmlSupport,
        Heading,
        Highlight,
        HorizontalLine,
        ImageBlock,
        ImageCaption,
        ImageEditing,
        ImageInline,
        ImageInsert,
        ImageInsertViaUrl,
        ImageResize,
        ImageStyle,
        ImageTextAlternative,
        ImageToolbar,
        ImageUpload,
        ImageUtils,
        Indent,
        IndentBlock,
        Italic,
        Link,
        LinkImage,
        List,
        ListProperties,
        Mention,
        Paragraph,
        PasteFromOffice,
        PictureEditing,
        RemoveFormat,
        SpecialCharacters,
        SpecialCharactersArrows,
        SpecialCharactersCurrency,
        SpecialCharactersEssentials,
        SpecialCharactersLatin,
        SpecialCharactersMathematical,
        SpecialCharactersText,
        Strikethrough,
        Subscript,
        Superscript,
        Table,
        TableCaption,
        TableCellProperties,
        TableColumnResize,
        TableProperties,
        TableToolbar,
        TextTransformation,
        TodoList,
        Underline,
      ],
      fontFamily: { supportAllValues: true },
      fontSize: {
        options: [10, 12, 14, 'default', 18, 20, 22, 24, 28, 32],
        supportAllValues: true,
      },
      heading: {
        options: [
          { model: 'paragraph', title: 'Paragraph', class: 'ck-heading_paragraph' },
          { model: 'heading1', view: 'h1', title: 'Heading 1', class: 'ck-heading_heading1' },
          { model: 'heading2', view: 'h2', title: 'Heading 2', class: 'ck-heading_heading2' },
          { model: 'heading3', view: 'h3', title: 'Heading 3', class: 'ck-heading_heading3' },
          { model: 'heading4', view: 'h4', title: 'Heading 4', class: 'ck-heading_heading4' },
          { model: 'heading5', view: 'h5', title: 'Heading 5', class: 'ck-heading_heading5' },
          { model: 'heading6', view: 'h6', title: 'Heading 6', class: 'ck-heading_heading6' },
        ],
      },
      htmlSupport: {
        allow: [{ name: /^.*$/, styles: true, attributes: true, classes: true }],
      },
      image: {
        toolbar: [
          'toggleImageCaption',
          'imageTextAlternative',
          '|',
          'imageStyle:inline',
          'imageStyle:wrapText',
          'imageStyle:breakText',
          '|',
          'resizeImage',
        ],
      },
      mention: {
        feeds: [{ marker: '@', feed: [] }],
      },
      link: {
        addTargetToExternalLinks: true,
        defaultProtocol: 'https://',
        decorators: {
          toggleDownloadable: {
            mode: 'manual',
            label: 'Downloadable',
            attributes: { download: 'file' },
          },
        },
      },
      list: {
        properties: { styles: true, startIndex: true, reversed: true },
      },
      table: {
        contentToolbar: [
          'tableColumn',
          'tableRow',
          'mergeTableCells',
          'tableProperties',
          'tableCellProperties',
        ],
      },
      placeholder: this.placeholder,
    };

    const merged: EditorConfig = {
      ...baseConfig,
      ...userConfig,
      toolbar: userConfig.toolbar ?? baseConfig.toolbar,
      plugins: userConfig.plugins ?? baseConfig.plugins,
      heading: userConfig.heading ?? baseConfig.heading,
      image: userConfig.image ?? baseConfig.image,
      link: userConfig.link ?? baseConfig.link,
      list: userConfig.list ?? baseConfig.list,
      table: userConfig.table ?? baseConfig.table,
      fontFamily: userConfig.fontFamily ?? baseConfig.fontFamily,
      fontSize: userConfig.fontSize ?? baseConfig.fontSize,
      htmlSupport: userConfig.htmlSupport ?? baseConfig.htmlSupport,
      placeholder: userConfig.placeholder ?? baseConfig.placeholder,
      mention: userConfig.mention ?? baseConfig.mention,
    };

    (merged as any).licenseKey = this.licenseKey;

    return merged;
  }

  private getValueByPath(obj: any, path: string): unknown {
    if (!obj || !path) return undefined;
    const tokens = path
      .replace(/\[(\d+)\]/g, '.$1')
      .split('.')
      .map((p) => p.trim())
      .filter(Boolean);
    let current: any = obj;
    for (const token of tokens) {
      if (current == null) return undefined;
      current = current[token];
    }
    return current;
  }

  private async ensureImageVisible(url: string, file: File): Promise<string> {
    const isOk = await this.checkImageUrl(url);
    if (isOk) {
      return url;
    }
    const dataUrl = await this.fileToDataUrl(file);
    return dataUrl;
  }

  private checkImageUrl(url: string, timeoutMs: number = 4000): Promise<boolean> {
    return new Promise((resolve) => {
      const img = new Image();
      let done = false;
      const timer = setTimeout(() => {
        if (done) return;
        done = true;
        resolve(false);
      }, timeoutMs);
      img.onload = () => {
        if (done) return;
        done = true;
        clearTimeout(timer);
        resolve(true);
      };
      img.onerror = () => {
        if (done) return;
        done = true;
        clearTimeout(timer);
        resolve(false);
      };
      img.src = url;
    });
  }

  private fileToDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });
  }

  private ensureImageInserted(url: string): void {
    const editor = this.editorInstance;
    if (!editor) return;
    setTimeout(() => {
      try {
        const data = editor.getData() ?? '';
        if (data.includes(url)) {
          return;
        }
        editor.model.change((writer: any) => {
          const imageElement = writer.createElement('imageBlock', { src: url });
          editor.model.insertContent(imageElement, editor.model.document.selection);
        });
      } catch (err) {
        console.error('CustomEditor failed to insert image', err);
      }
    }, 0);
  }
}
