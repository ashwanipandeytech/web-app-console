import { ChangeDetectorRef, Component, ElementRef, inject, Optional, Output, ViewChild,ViewEncapsulation, type AfterViewInit  } from '@angular/core';
import { CommonModule, NgClass } from '@angular/common';
import {SpecialCharacterHelper} from 'shared-lib/services/special-character-helper'
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

import { DataService } from 'shared-lib';
import { catchError, of } from 'rxjs';
import { GlobalService } from '../../../global.service';
import { MatTreeModule } from '@angular/material/tree';
import { environment } from 'environments/environment';
import { MatIconModule } from '@angular/material/icon';
import { SharedModule } from '../../../shared.module';
import { CategoryTreeComponent } from './category-tree/category-tree.component';
import { PRODUCT_TYPE } from 'shared-lib/constants/app-constant';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { MyUploadAdapter } from '../../../../ckeditor-upload-adapter';

// import { QuillEditorComponent, QuillModule } from 'ngx-quill';
// // import Quill from 'quill';
// // import { ImageHandler, Options } from 'ngx-quill-upload';
// import Quill from 'quill';
// import HtmlEditButton from 'quill-html-edit-button';
import { QuillEditorComponent, QuillModule } from 'ngx-quill';
import Quill from 'quill';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import {
	type EditorConfig,
	ClassicEditor,
	Autosave,
	Essentials,
	Paragraph,
	Autoformat,
	TextTransformation,
	LinkImage,
	Link,
	ImageBlock,
	ImageToolbar,
	BlockQuote,
	Bold,
	Bookmark,
	CKBox,
	CloudServices,
	ImageUpload,
	ImageInsert,
	ImageInsertViaUrl,
	AutoImage,
	PictureEditing,
	CKBoxImageEdit,
	TableColumnResize,
	Table,
	TableToolbar,
	Emoji,
	Mention,
	PasteFromOffice,
	FindAndReplace,
	FontBackgroundColor,
	FontColor,
	FontFamily,
	FontSize,
	Fullscreen,
	Heading,
	Highlight,
	HorizontalLine,
	ImageTextAlternative,
	ImageCaption,
	ImageResize,
	ImageStyle,
	Indent,
	IndentBlock,
	Code,
	ImageInline,
	Italic,
	AutoLink,
	ListProperties,
	List,
	ImageUtils,
	ImageEditing,
	// PageBreak,
	RemoveFormat,
	SpecialCharactersArrows,
	SpecialCharacters,
	SpecialCharactersCurrency,
	SpecialCharactersEssentials,
	SpecialCharactersLatin,
	SpecialCharactersMathematical,
	SpecialCharactersText,
	Strikethrough,
	Style,
	GeneralHtmlSupport,
	Subscript,
	Superscript,
	TableCaption,
	TableCellProperties,
	TableProperties,
	Alignment,
	TodoList,
	Underline,
  SourceEditing 
} from 'ckeditor5';
// import {
// 	CaseChange,
// 	PasteFromOfficeEnhanced,
// 	ExportPdf,
// 	// ExportWord,
// 	Footnotes,
// 	FormatPainter,
// 	ImportWord,
// 	LineHeight,
// 	MergeFields,
// 	MultiLevelList,
// 	SlashCommand,
// 	// TableOfContents,
// 	// Template,
// } from 'ckeditor5-premium-features';
const LICENSE_KEY =
	'eyJhbGciOiJFUzI1NiJ9.eyJleHAiOjE3NzExMTM1OTksImp0aSI6IjYyOWZhMjQwLWU5NDYtNDVhMy1hYzY0LTIyMGUyZWI4ZGZjMyIsInVzYWdlRW5kcG9pbnQiOiJodHRwczovL3Byb3h5LWV2ZW50LmNrZWRpdG9yLmNvbSIsImRpc3RyaWJ1dGlvbkNoYW5uZWwiOlsiY2xvdWQiLCJkcnVwYWwiLCJzaCJdLCJ3aGl0ZUxhYmVsIjp0cnVlLCJsaWNlbnNlVHlwZSI6InRyaWFsIiwiZmVhdHVyZXMiOlsiKiJdLCJ2YyI6IjIwNDIxM2VlIn0.ByZeqEIV_6l6BZ1s3SuFFbgaOv60egZva89wCzbr7URIsTuFrRotsm1w0fGYlLud_15hr0klDJNg4GFlwsT49Q';

const CLOUD_SERVICES_TOKEN_URL =
	'https://gsjyluoko7vp.cke-cs.com/token/dev/3dc507cb274be8ba1b2ca41f75590f5e5da39ef56ec4968e9a8a601b7b62?limit=10';
// import HtmlEditButton from 'quill-html-edit-button';
// import htmlEditButton from 'quill-html-edit-button';
// ../../../../../../../node_modules/@angular/common/common_module.d
// import { CommonModule, NgClass } from "../../../../../../../node_modules/@angular/common/common_module.d";
// Quill.register('modules/imageHandler', ImageHandler);
// Quill.register('modules/htmlEditButton', htmlEditButton);

interface FoodNode {
  name: string;
  children?: FoodNode[];
}
@Component({
  selector: 'app-add-customer',
  imports: [ReactiveFormsModule, QuillModule, MatTreeModule, MatIconModule, CategoryTreeComponent, NgClass,CommonModule,FormsModule,CKEditorModule],
  templateUrl: './add-product.html',
  styleUrl: './add-product.scss',
})
export class AddProduct {
  specialCharacterHelper = inject(SpecialCharacterHelper)
  childrenAccessor = (node: FoodNode) => node.children ?? [];
  @ViewChild('galleryInput') galleryInput!: ElementRef<HTMLInputElement>;
  @ViewChild('descriptionImageGallery') descriptionImageGallery!: ElementRef<HTMLInputElement>;
  @ViewChild('quillEditor') quillEditor!: QuillEditorComponent;
  @ViewChild('productDescriptionQuill') productDescriptionQuill!: QuillEditorComponent;
  @Output() data: any = {
    price_data: {},
    shipping_info: {},
    shipping_config: {},
    offer: {},

  };
  editorTheme: 'light' | 'dark' = 'light';
modulesNoImage = {
  toolbar: [
    // --- FONT FAMILY & SIZE ---
    [
      { font: [
        'sans-serif',
        'serif',
        'monospace',
        'roboto',
        'lato',
        'poppins',
        'montserrat'
      ]},
      { size: ['small', false, 'large', 'huge'] }
    ],

    // --- HEADINGS (H1–H6) ---
    [
      { header: [1, 2, 3, 4, 5, 6, false] }
    ],

    // --- TEXT STYLE ---
    ['bold', 'italic', 'underline', 'strike'],
    [{ color: [] }, { background: [] }],
    [{ script: 'sub' }, { script: 'super' }],

    // --- BLOCK ELEMENTS ---
    ['blockquote', 'code-block'],

    // --- LISTS & INDENTS ---
    [{ list: 'ordered' }, { list: 'bullet' }],
    [{ indent: '-1' }, { indent: '+1' }],
    [{ direction: 'rtl' }],

    // --- ALIGNMENT ---
    [{ align: [] }],

    // --- LINKS & MEDIA ---
    ['link', 'formula'],

    // --- UTILS ---
    ['clean']
  ]
};




  // modulesWithImage = {
  //   htmlEditButton: {
  //     debug: true, // Developers love logs
  //     msg: "Edit HTML", // Tooltip
  //     okText: "Save",
  //   },
  //   toolbar: [
  //     // --- TEXT STYLE ---
  //     [{ 'font': [] }, { 'size': ['small', false, 'large', 'huge'] }],
  //     ['bold', 'italic', 'underline', 'strike'],
  //     [{ 'color': [] }, { 'background': [] }],
  //     [{ 'script': 'sub' }, { 'script': 'super' }],

  //     // --- HEADER & QUOTES ---
  //     [{ 'header': 1 }, { 'header': 2 }, 'blockquote',],

  //     // --- LISTS & INDENTS ---
  //     [{ 'list': 'ordered' }, { 'list': 'bullet' }],
  //     [{ 'indent': '-1' }, { 'indent': '+1' }],
  //     [{ 'direction': 'rtl' }],

  //     // --- ALIGNMENT ---
  //     [{ 'align': [] }],

  //     // --- LINKS & MEDIA ---
  //     ['link', 'image', 'formula'],
  //     // ['htmlEditButton'],
  //     // --- UTILS ---
  //     ['clean']
  //   ],
  //   imageHandler: {
  //     upload: (file: File) => {

  //       return new Promise((resolve, reject) => {

  //         // 1. Validation Logic
  //         if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
  //           console.info('Unsupported type');
  //           return reject('Unsupported type');
  //         }
  //         if (file.size > 1000000) {
  //           console.info('Size');
  //           return reject('Size too large (Max 1MB)');
  //         }

  //         // 2. Call the Service
  //         const formData = new FormData();
  //         formData.append('files', file);
  //         formData.append('type', 'product_image_description');

  //         this.dataService
  //           .postForm('gallery', formData)
  //           .pipe(
  //             catchError((err) => {
  //               return of(null);
  //             })
  //           )
  //           .subscribe((res: any) => {
  //             console.log('Response:', res);
  //             resolve(res.data[0].url);

  //           });

  //       });
  //     },
  //     accepts: ['png', 'jpg', 'jpeg', 'jfif']
  //   } as Options,




  // };

modulesWithImage = {
    //   htmlEditButton: {
    //   debug: true, // Developers love logs
    //   msg: "Edit HTML", // Tooltip
    //   okText: "Save",
    // },
  toolbar: {
    container: [
      [{ font: [
        'sans-serif',
        'serif',
        'monospace',
        'roboto',
        'lato',
        'poppins',
        'montserrat'
      ] },
       { size: ['small', false, 'large', 'huge'], }],
       [
      { header: [1, 2, 3, 4, 5, 6, false] }
    ],
      ['bold', 'italic', 'underline', 'strike'],
      [{ color: [] }, { background: [] }],
      [{ header: 1 }, { header: 2 }],
      [{ list: 'ordered' }, { list: 'bullet' }],
      [{ align: [] }],
      ['link', 'image'],
      ['clean'],
    ],
    handlers: {
      image: () => this.handleImageUpload(),
    },
  },
};


  dataSource = [];
  inputControlName: any;
  	public isLayoutReady = false;
	public Editor = ClassicEditor;
	public config: EditorConfig = {};
  	public ngAfterViewInit(): void {
		this.config = {
			toolbar: {
				items: [
					'undo',
					'redo',
					// '|',
          'sourceEditing',
          'link',
					'insertImage',
					'insertTable',
					// 'highlight',
					// 'insertMergeField',
					// 'previewMergeFields',
					// '|',
					// 'formatPainter',
					// '|',
					'heading',
					// 'style',
					// '|',
					'fontSize',
					'fontFamily',
					'fontColor',
					'fontBackgroundColor',
					// '|',
					'bold',
					'italic',
					'underline',
					// '|',
					'blockQuote',
					// 'alignment',
					// 'lineHeight',
					// '|',
					'bulletedList',
					'numberedList',
					'multiLevelList',
					'todoList',
					'outdent',
					'indent'
				],
				shouldNotGroupWhenFull: false
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
				// CaseChange,
				CKBox,
				CKBoxImageEdit,
				CloudServices,
				Code,
				Emoji,
				Essentials,
				// ExportPdf,
				// ExportWord,
				FindAndReplace,
				FontBackgroundColor,
				FontColor,
				FontFamily,
				FontSize,
				// Footnotes,
				// FormatPainter,
				Fullscreen,
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
				// ImportWord,
				Indent,
				IndentBlock,
				Italic,
				// LineHeight,
				Link,
				LinkImage,
				List,
				ListProperties,
				Mention,
				// MergeFields,
				// MultiLevelList,
				// PageBreak,
				Paragraph,
				PasteFromOffice,
				// PasteFromOfficeEnhanced,
				PictureEditing,
				RemoveFormat,
				// SlashCommand,
				SpecialCharacters,
				SpecialCharactersArrows,
				SpecialCharactersCurrency,
				SpecialCharactersEssentials,
				SpecialCharactersLatin,
				SpecialCharactersMathematical,
				SpecialCharactersText,
				Strikethrough,
				Style,
				Subscript,
				Superscript,
				Table,
				TableCaption,
				TableCellProperties,
				TableColumnResize,
				// TableOfContents,
				TableProperties,
				TableToolbar,
				// Template,
				TextTransformation,
				TodoList,
				Underline
			],
			cloudServices: {
				tokenUrl: CLOUD_SERVICES_TOKEN_URL
			},
			exportPdf: {
				stylesheets: [
					/* This path should point to the content stylesheets on your assets server. */
					/* See: https://ckeditor.com/docs/ckeditor5/latest/features/converters/export-pdf.html */
					'./export-style.css',
					/* Export PDF needs access to stylesheets that style the content. */
					'https://cdn.ckeditor.com/ckeditor5/47.4.0/ckeditor5.css',
					'https://cdn.ckeditor.com/ckeditor5-premium-features/47.4.0/ckeditor5-premium-features.css'
				],
				fileName: 'export-pdf-demo.pdf',
				converterOptions: {
					format: 'Tabloid',
					margin_top: '20mm',
					margin_bottom: '20mm',
					margin_right: '24mm',
					margin_left: '24mm',
					page_orientation: 'portrait'
				}
			},
			exportWord: {
				stylesheets: [
					/* This path should point to the content stylesheets on your assets server. */
					/* See: https://ckeditor.com/docs/ckeditor5/latest/features/converters/export-word.html */
					'./export-style.css',
					/* Export Word needs access to stylesheets that style the content. */
					'https://cdn.ckeditor.com/ckeditor5/47.4.0/ckeditor5.css',
					'https://cdn.ckeditor.com/ckeditor5-premium-features/47.4.0/ckeditor5-premium-features.css'
				],
				fileName: 'export-word-demo.docx',
				converterOptions: {
					document: {
						orientation: 'portrait',
						size: 'Tabloid',
						margins: {
							top: '20mm',
							bottom: '20mm',
							right: '24mm',
							left: '24mm'
						}
					}
				}
			},
			fontFamily: {
				supportAllValues: true
			},
			fontSize: {
				options: [10, 12, 14, 'default', 18, 20, 22],
				supportAllValues: true
			},
			fullscreen: {
				onEnterCallback: container =>
					container.classList.add(
						'editor-container',
						'editor-container_classic-editor',
						'editor-container_include-style',
						'editor-container_include-fullscreen',
						'main-container'
					)
			},
			heading: {
				options: [
					{
						model: 'paragraph',
						title: 'Paragraph',
						class: 'ck-heading_paragraph'
					},
					{
						model: 'heading1',
						view: 'h1',
						title: 'Heading 1',
						class: 'ck-heading_heading1'
					},
					{
						model: 'heading2',
						view: 'h2',
						title: 'Heading 2',
						class: 'ck-heading_heading2'
					},
					{
						model: 'heading3',
						view: 'h3',
						title: 'Heading 3',
						class: 'ck-heading_heading3'
					},
					{
						model: 'heading4',
						view: 'h4',
						title: 'Heading 4',
						class: 'ck-heading_heading4'
					},
					{
						model: 'heading5',
						view: 'h5',
						title: 'Heading 5',
						class: 'ck-heading_heading5'
					},
					{
						model: 'heading6',
						view: 'h6',
						title: 'Heading 6',
						class: 'ck-heading_heading6'
					}
				]
			},
			htmlSupport: {
				allow: [
					{
						name: /^.*$/,
						styles: true,
						attributes: true,
						classes: true
					}
				]
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
					'|',
					'ckboxImageEdit'
				]
			},
			initialData:'',
			licenseKey: LICENSE_KEY,
			lineHeight: {
  options: ['1', '1.15', '1.5', '2'],
},
			link: {
				addTargetToExternalLinks: true,
				defaultProtocol: 'https://',
				decorators: {
					toggleDownloadable: {
						mode: 'manual',
						label: 'Downloadable',
						attributes: {
							download: 'file'
						}
					}
				}
			},
			list: {
				properties: {
					styles: true,
					startIndex: true,
					reversed: true
				}
			},
			mention: {
				feeds: [
					{
						marker: '@',
						feed: [
							/* See: https://ckeditor.com/docs/ckeditor5/latest/features/mentions.html */
						]
					}
				]
			},
			menuBar: {
				isVisible: true
			},
			mergeFields: {
				/* Read more: https://ckeditor.com/docs/ckeditor5/latest/features/merge-fields.html#configuration */
			},
			placeholder: 'Type or paste your content here!',
			style: {
				definitions: [
					{
						name: 'Article category',
						element: 'h3',
						classes: ['category']
					},
					{
						name: 'Title',
						element: 'h2',
						classes: ['document-title']
					},
					{
						name: 'Subtitle',
						element: 'h3',
						classes: ['document-subtitle']
					},
					{
						name: 'Info box',
						element: 'p',
						classes: ['info-box']
					},
					{
						name: 'CTA Link Primary',
						element: 'a',
						classes: ['button', 'button--green']
					},
					{
						name: 'CTA Link Secondary',
						element: 'a',
						classes: ['button', 'button--black']
					},
					{
						name: 'Marker',
						element: 'span',
						classes: ['marker']
					},
					{
						name: 'Spoiler',
						element: 'span',
						classes: ['spoiler']
					}
				]
			},
			table: {
				contentToolbar: ['tableColumn', 'tableRow', 'mergeTableCells', 'tableProperties', 'tableCellProperties']
			},
			// template: {
			// 	definitions: [
			// 		{
			// 			title: 'Introduction',
			// 			description: 'Simple introduction to an article',
			// 			icon: '<svg width="45" height="45" viewBox="0 0 45 45" fill="none" xmlns="http://www.w3.org/2000/svg">\n    <g id="icons/article-image-right">\n        <rect id="icon-bg" width="45" height="45" rx="2" fill="#A5E7EB"/>\n        <g id="page" filter="url(#filter0_d_1_507)">\n            <path d="M9 41H36V12L28 5H9V41Z" fill="white"/>\n            <path d="M35.25 12.3403V40.25H9.75V5.75H27.7182L35.25 12.3403Z" stroke="#333333" stroke-width="1.5"/>\n        </g>\n        <g id="image">\n            <path id="Rectangle 22" d="M21.5 23C21.5 22.1716 22.1716 21.5 23 21.5H31C31.8284 21.5 32.5 22.1716 32.5 23V29C32.5 29.8284 31.8284 30.5 31 30.5H23C22.1716 30.5 21.5 29.8284 21.5 29V23Z" fill="#B6E3FC" stroke="#333333"/>\n            <path id="Vector 1" d="M24.1184 27.8255C23.9404 27.7499 23.7347 27.7838 23.5904 27.9125L21.6673 29.6268C21.5124 29.7648 21.4589 29.9842 21.5328 30.178C21.6066 30.3719 21.7925 30.5 22 30.5H32C32.2761 30.5 32.5 30.2761 32.5 30V27.7143C32.5 27.5717 32.4391 27.4359 32.3327 27.3411L30.4096 25.6268C30.2125 25.451 29.9127 25.4589 29.7251 25.6448L26.5019 28.8372L24.1184 27.8255Z" fill="#44D500" stroke="#333333" stroke-linejoin="round"/>\n            <circle id="Ellipse 1" cx="26" cy="25" r="1.5" fill="#FFD12D" stroke="#333333"/>\n        </g>\n        <rect id="Rectangle 23" x="13" y="13" width="12" height="2" rx="1" fill="#B4B4B4"/>\n        <rect id="Rectangle 24" x="13" y="17" width="19" height="2" rx="1" fill="#B4B4B4"/>\n        <rect id="Rectangle 25" x="13" y="21" width="6" height="2" rx="1" fill="#B4B4B4"/>\n        <rect id="Rectangle 26" x="13" y="25" width="6" height="2" rx="1" fill="#B4B4B4"/>\n        <rect id="Rectangle 27" x="13" y="29" width="6" height="2" rx="1" fill="#B4B4B4"/>\n        <rect id="Rectangle 28" x="13" y="33" width="16" height="2" rx="1" fill="#B4B4B4"/>\n    </g>\n    <defs>\n        <filter id="filter0_d_1_507" x="9" y="5" width="28" height="37" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">\n            <feFlood flood-opacity="0" result="BackgroundImageFix"/>\n            <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>\n            <feOffset dx="1" dy="1"/>\n            <feComposite in2="hardAlpha" operator="out"/>\n            <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.29 0"/>\n            <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_1_507"/>\n            <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_1_507" result="shape"/>\n        </filter>\n    </defs>\n</svg>\n',
			// 			data: "<h2>Introduction</h2><p>In today's fast-paced world, keeping up with the latest trends and insights is essential for both personal growth and professional development. This article aims to shed light on a topic that resonates with many, providing valuable information and actionable advice. Whether you're seeking to enhance your knowledge, improve your skills, or simply stay informed, our comprehensive analysis offers a deep dive into the subject matter, designed to empower and inspire our readers.</p>"
			// 		}
			// 	]
			// }
		};
    this.configUpdateAlert(this.config);

		this.isLayoutReady = true;
		// this.changeDetector.detectChanges();
	}
 configUpdateAlert(config: any) {
	if ((this.configUpdateAlert as any).configUpdateAlertShown) {
		return;
	}

	const isModifiedByUser = (currentValue: string | undefined, forbiddenValue: string) => {
		if (currentValue === forbiddenValue) {
			return false;
		}

		if (currentValue === undefined) {
			return false;
		}

		return true;
	};

	const valuesToUpdate = [];

	(this.configUpdateAlert as any).configUpdateAlertShown = true;

	if (!isModifiedByUser(config.licenseKey, '<YOUR_LICENSE_KEY>')) {
		valuesToUpdate.push('LICENSE_KEY');
	}

	if (!isModifiedByUser(config.cloudServices?.tokenUrl, '<YOUR_CLOUD_SERVICES_TOKEN_URL>')) {
		valuesToUpdate.push('CLOUD_SERVICES_TOKEN_URL');
	}

	if (valuesToUpdate.length) {
		window.alert(
			[
				'Please update the following values in your editor config',
				'to receive full access to Premium Features:',
				'',
				...valuesToUpdate.map(value => ` - ${value}`)
			].join('\n')
		);
	}
}
onReady(editor: any) {
  editor.plugins.get('FileRepository').createUploadAdapter = (loader: any) => {
    return new MyUploadAdapter(loader, this.dataService);
  };
  
  editor.editing.view.document.on(
    'clipboardInput',
    (evt: any, data: any) => {
      const text = data.dataTransfer.getData('text/plain');
      if (!text) return;

      // Detect tab-separated content
      if (text.includes('\t')) {
        evt.stop();

        const rows = text
          .split('\n')
          .map((r:any) => r.split('\t'))
          .filter((r:any) => r.length > 1);

        if (!rows.length) return;

        const tableHtml = `
          <table>
            <tbody>
              ${rows
                .map((cols:any) =>
                    `<tr>${cols.map((c:any) => `<td>${c.trim()}</td>`).join('')}</tr>`
                )
                .join('')}
            </tbody>
          </table>
        `;

        editor.model.change((writer: any) => {
          const viewFragment = editor.data.processor.toView(tableHtml);
          const modelFragment = editor.data.toModel(viewFragment);
          editor.model.insertContent(modelFragment);
        });
      }
    }
  );
}

handleImageUpload() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/png,image/jpeg,image/jpg';
  input.click();

  input.onchange = () => {
    const file = input.files?.[0];
    if (!file) return;

    if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
      console.info('Unsupported type');
      return;
    }

    if (file.size > 1_000_000) {
      console.info('Size too large');
      return;
    }

    const formData = new FormData();
    formData.append('files', file);
    formData.append('type', 'product_image_description');

    this.dataService.postForm('gallery', formData).subscribe((res: any) => {
      const imageUrl = res?.data?.[0]?.url;
      if (!imageUrl) return;

      const quill = (this as any).descriptionImageGallery?.quillEditor;
      const range = quill.getSelection(true);
      quill.insertEmbed(range.index, 'image', imageUrl);
      quill.setSelection(range.index + 1);
    });
  };
}

toggleTheme() {
  this.editorTheme = this.editorTheme === 'light' ? 'dark' : 'light';
}
  hasChild = (_: number, node: FoodNode) => !!node.children && node.children.length > 0;
  productDetails!: FormGroup;
  inventoryForm!: FormGroup;
  // priceForm!: FormGroup;
  shippingInfoForm!: FormGroup;
  videoForm!: FormGroup;
  shippingConfigForm!: FormGroup;
  offerForm!: FormGroup;
  seoForm!: FormGroup;
  categoryForm!: FormGroup;
  publishForm!: FormGroup;
  productOptionData!: FormGroup;
  productMultipleOptionForm!: FormGroup;
  tagsForm!: FormGroup;
  commonTags = ['mobile', 'tab', 'watch', 't-shirt', 'shirt', 'book', 'monitor', 'cloth'];
  categories = [
    {
      id: 'catFinance',
      name: 'Finance',
      subCategories: [
        { id: 'catBanking', name: 'Banking' },
        {
          id: 'catAccounting',
          name: 'Accounting',
          subCategories: [{ id: 'catBangladeshBank', name: 'BangladeshBank' }],
        },
      ],
    },
    {
      id: 'catFashion',
      name: 'Fashion & Clothing',
      subCategories: [
        { id: 'catTShirt', name: 't-Shirt' },
        {
          id: 'catShirt',
          name: 'Shirt',
          subCategories: [{ id: 'catCasualShirt', name: 'Casual Shirt' }],
        },
      ],
    },
    { id: 'catBag', name: 'Bag' },
    { id: 'catMonitor', name: 'Monitor' },
    { id: 'catKeyboard', name: 'Keyboard' },
    { id: 'catMouse', name: 'Mouse' },
  ];
  productMediaSection!: FormGroup;
  thumbFile: any;
  galleryFiles: any;
  thumbPreview: any = [];
  productInventrySection!: FormGroup;
  priceSection!: FormGroup;
  shippingInfoSection!: FormGroup;
  productAttributesForm!: FormGroup;
  public dataService: any = inject(DataService);
  categoryListData: any = {
    isSelectedCategory: {},
    categories: []
  };
  parentId!: Number;
  selectedThumbImg: any;
  thumbGallery: any = [];
  permaLink: any;
  isInputShow: boolean = false;
  domain: string = '';
  productStatus: any = [];
  wrongDiscount: boolean = false;
  selectProductDesciptionImageGallery: File[] = [];
  prodDescriptionImageGallery: any = [];
  selectedFile: File[] = [];
  statusMap: any = [];
  isUpdateproduct: boolean = false;
  finalpriceObj: any;
  showHtmlEditor = false;
htmlControl = new FormControl('');
  constructor(
    private fb: FormBuilder,
    private globalService: GlobalService,
    private cd: ChangeDetectorRef,
    @Optional() public activeModal: NgbActiveModal
  ) {
    this.productStatus = PRODUCT_TYPE;

  }
openHtmlEditor(quillName:any) {
  this.inputControlName = quillName;
  this.htmlControl.setValue(
    this.productDetails.get(quillName)?.value || ''
  );

  this.showHtmlEditor = true;
}

closeHtmlEditor() {
  this.showHtmlEditor = false;
}

saveHtml() {
  this.productDetails
    .get(this.inputControlName)
    ?.setValue(this.htmlControl.value);

  this.showHtmlEditor = false;
}
  onGetId(id: number) {
    this.parentId = id;
  }
  ngOnInit() {
// const HtmlEditButtonClass =
//     (HtmlEditButton as any).default ?? HtmlEditButton;

//   (Quill as any).register(
//     'modules/htmlEditButton',
//     HtmlEditButtonClass,
//     true
//   );
    this.domain = window.location.origin;
    this.getCategoryList();
    this.initializeForms();
    // this.initializeCategoryControls();

  }
  isNotEmpty(obj: any): boolean {
    return obj && Object.keys(obj).length > 0;
  }
  initializeForms() {
    // console.log('data',this.data);
    // console.log('this.data.category.length ===>',this.data.images );
    console.log('log==>', this.data?.item);
    //    Object.keys(this.data.flags || {}).length ||
    // Object.keys(this.data.images || {}).length ||

    this.permaLink = this.data?.item?.product_details?.permaLink;
    const hasValidData =
      Object.keys(this.data?.item?.product_details || {}).length;
    if (this.data?.item && hasValidData) {
      console.log('log==> enrer', this.data?.item);
      this.isUpdateproduct = true;
      if (this.data?.item?.flags) {
        console.log('this.data.category.length ===>', this.data?.item.flags);

        this.productStatus = this.data?.item.flags;
      }
      if (this.data?.item?.images) {
        this.thumbGallery = this.data?.item?.images
          ?.filter((img: any) => img.type === 'gallery')
          .map((img: any) => img.url);

        this.thumbPreview = this.data?.item?.images
          ?.filter((img: any) => img.type === "thumbnail")
          .map((img: any) => img.url);
        console.log('thumbPreview===>', this.thumbGallery);

        // this.thumbPreview =  environment.DOMAIN + '/' + this.data?.thumbnail;
        // console.log('thumbPreview==>',this.thumbPreview);

        // this.cd.detectChanges();
      }
      if (this.data?.item?.category) {
        console.log(' this.data?.category==>', Array.isArray(this.data?.item?.category));

        // category exists and is NOT blank
        // this.getCategoryList();
        this.addProductDetails();
        this.productOptionType();
        this.submitProductMultipleOptionForm();
        // this.addCategoriesForm();
        this.addTagsForm();
        this.mediaForm();
        this.inventryForm();
        this.priceForm();
        this.shippingForm();
        this.productAttributeForm();
        this.shippingConfigForms();
        this.offerFormGroup();
        this.seoFormGroup();
      }
    }
    else {
      this.addProductDetails();
      this.productOptionType();
      this.submitProductMultipleOptionForm();
      // this.addCategoriesForm();
      this.addTagsForm();
      this.mediaForm();
      this.inventryForm();
      this.priceForm();
      this.shippingForm();
      this.productAttributeForm();
      this.shippingConfigForms();
      this.offerFormGroup();
      this.seoFormGroup();
    }
    // this.addInverntoryForm();
  }
  closeModal() {
    this.activeModal.close();
    this.isUpdateproduct = true;

  }
  addProductDetails() {
    this.productDetails = this.fb.group({
      productTitle: [this.data?.item?.title, Validators.required], //product_title
      shortDescription: [this.data?.item?.product_details?.shortDescription], //short_description
      productDescription: [this.data?.item?.product_details?.productDescription], //description
      features: [this.data?.item?.product_details?.features], //features
      permaLink:[this.data?.item?.product_details?.permaLink],
      // productStatus: [this.data?.item.attributes?.productDetailsObj?.productStatus],
      productDescriptionImageGallery: [this.data?.item?.product_details?.productDescriptionImageGallery]
    });
  }
  get addProductDetailsValidation() {
    return this.productDetails?.controls;
  }

  //   getStatusKeys(): string[] {
  //   return Object.keys(this.productStatus);
  // }

  onStatusChange(index: any, event: any) {
    this.productStatus[index].isActive = event.target.checked;

    console.log('Updated productStatus =>', this.productStatus);
  }


  // if (event.target.checked) {
  //   this.productStatusArray.push(new FormControl(value));
  // } else {
  //   const index = this.productStatusArray.controls
  //     .findIndex(x => x.value === value);

  //   this.productStatusArray.removeAt(index);
  // }
  productOptionType() {
    this.productOptionData = this.fb.group({
      generalProductData: [false],
      downloadableProductData: [false],
    });
  }

  // onStatusChange(event: any) {
  //   const selectedOptions = Array.from(event.target.selectedOptions).map(
  //     (option: any) => option.value
  //   );

  //   this.productDetails.patchValue({
  //     productStatus: selectedOptions,
  //   });
  // }

  mediaForm() {
    this.productMediaSection = this.fb.group({
      thumbUpload: ['', Validators.required],
      galleryUpload: []
    });
  }

  inventryForm() {
    this.productInventrySection = this.fb.group({
      sku: [this.data?.item?.sku, Validators.required],
      manageStock: [this.data?.item?.inventory?.manageStock],
      stockStatus: [this.data?.item?.inventory?.stockStatus],
      soldIndividually: [this.data?.item?.inventory?.soldIndividually],
      productCode: [this.data?.item?.inventory?.productCode],
      lowStockWarning: [this.data?.item?.inventory?.lowStockWarning],
      showStockQuantity: [this.data?.item?.inventory?.showStockQuantity],
      showStockWithText: [this.data?.item?.inventory?.showStockWithText],
      hideStock: [this.data?.item?.inventory?.hideStock],
    });
  }

  priceForm() {
    this.priceSection = this.fb.group({
      regularPrice: [this.data?.item?.price_data?.regularPrice, [Validators.required, Validators.min(1)]],
      salePrice: [this.data?.item?.price_data?.salePrice, [Validators.min(0)]],
      gstPercent: [this.data?.item?.price_data?.gstPercent],
      discountType: ['Flat'],
      priceDateStart: [''],
      priceDateEnd: [''],
    });

    // Subscribe to discount type changes to update validators
    this.priceSection.get('discountType')?.valueChanges.subscribe(type => {
      this.updateDiscountValidators(type);
    });
  }
  getGstDiscount() {
    this.finalpriceObj = this.priceSection.value;
    this.finalpriceObj.lastUpdatedDate = new Date().getTime();
    let finalPayload: any = {};
    // console.log('priceObj==>',finalpriceObj);

    if (this.finalpriceObj.regularPrice >= this.finalpriceObj.salePrice) {
      finalPayload.salePrice = this.finalpriceObj.salePrice;
    }
    else {
      finalPayload.salePrice = this.finalpriceObj.regularPrice;
    }
    finalPayload.quantity = 1;
    finalPayload.gstPercent = this.priceSection.value.gstPercent;

    // let payLoad = 
    this.dataService
      .postCommonApi(finalPayload, 'calculate-prices')
      .pipe(
        catchError((err) => {
          console.error('Error:', err);
          setTimeout(() => {
            // this.globalService.showMsgSnackBar(err);
          }, 100);
          return of(err);
        })
      )
      .subscribe((res: any) => {
        console.log('res==>', res);
        if (res.success) {
          this.finalpriceObj.caclulatedObj = res.data;
          this.cd.detectChanges();
        }
      })
  }
  shippingForm() {
    this.shippingInfoSection = this.fb.group({
      weight: [this.data?.item?.shipping_info?.weight, Validators.min(0)],
      length: [this.data?.item?.shipping_info?.length, Validators.min(0)],
      width: [this.data?.item?.shipping_info?.width, Validators.min(0)],
      height: [this.data?.item?.shipping_info?.height, Validators.min(0)],
      shippingClass: ['0'],
    });
  }
  productAttributeForm() {
    this.productAttributesForm = this.fb.group({
      selectedAttribute: [''],
      attributes: this.fb.array([]),
    });
  }
  get attributes(): FormArray {
    return this.productAttributesForm.get('attributes') as FormArray;
  }
  addAttribute() {
    const attr = this.fb.group({
      name: [''], // attribute name
      value: [''], // attribute value
    });

    this.attributes.push(attr);
    //console.log('this.attributes==>', this.attributes);
  }

  shippingConfigForms() {
    this.shippingConfigForm = this.fb.group({
      estimateShippingTime: [this.data?.item?.shipping_config?.estimateShippingTime],
      freeShipping: [this.data?.item?.shipping_config?.freeShipping],
      flatRate: [this.data?.item?.shipping_config?.flatRate],
      quantityMulitiply: [this.data?.item?.shipping_config?.quantityMulitiply],
      cashOnDelivery: [this.data?.item?.shipping_config?.cashOnDelivery],
    });
  }

  offerFormGroup() {
    this.offerForm = this.fb.group({
      flashDeal: [this.data?.item?.offer?.flashDeal],
      todaysDeal: [this.data?.item?.offer?.todaysDeal],
      featured: [this.data?.item?.offer?.featured],
    });
  }
  seoFormGroup() {
    this.seoForm = this.fb.group({
      focusKeyphrase: [this.data?.item?.seo?.focusKeyphrase, Validators.required],
      metaTitle: [this.data?.item?.seo?.metaTitle, [Validators.required, Validators.maxLength(60)]],
      slugText: [this.data?.item?.seo?.slugText, [Validators.required, Validators.pattern('^[a-z0-9-]+$')]],
      metaDscr: [this.data?.item?.seo?.metaDscr, [Validators.required, Validators.maxLength(160)]],
    });
  }

  submitProductMultipleOptionForm() {
    this.productMultipleOptionForm = this.fb.group({
      // Media Tab
      // thumbUpload: ['', Validators.required],
      // galleryUpload: [''],

      // Inventory Tab
      // sku: ['', Validators.required],
      // manageStock: [false],
      // stockStatus: [],
      // soldIndividually: [false],
      // productCode: [''],
      // lowStockWarning: [0],
      // showStockQuantity: [false],
      // showStockWithText: [false],
      // hideStock: [false],

      // Price Tab
      // regularPrice: [0, [Validators.required, Validators.min(0)]],
      // salePrice: [0, Validators.min(0)],
      // discountType: ['1'],
      // priceDateStart: [''],
      // priceDateEnd: [''],

      //attribute

      // Shipping Info Tab
      // weight: [0, Validators.min(0)],
      // length: [0, Validators.min(0)],
      // width: [0, Validators.min(0)],
      // height: [0, Validators.min(0)],
      // shippingClass: ['0'],

      // Shipping COnfiguration
      // estimateShippingTime: [''],
      // freeShipping: [false],
      // flatRate: [false],
      // quantityMulitiply: [false],
      // cashOnDelivery: [false],

      // offer
      // flashDeal: [false],
      // todaysDeal: [false],
      // featured: [false],

      // SEO Data
      // focusKeyphrase: ['', Validators.required],
      // metaTitle: ['', [Validators.required, Validators.maxLength(60)]],
      // slugText: ['', [Validators.required, Validators.pattern('^[a-z0-9-]+$')]],
      // metaDscr: ['', [Validators.required, Validators.maxLength(160)]],

      // Published Panel
      status: ['1', Validators.required],
      visibility: ['1', Validators.required],
      publishDate: ['', Validators.required],

      // Category Panel
      // categorySearch: [''],
      // newCategoryName: ['', Validators.required],
      // newCategoryParent: ['']
    });
  }

  // addCategoriesForm() {
  //   this.categoryForm = this.fb.group({
  //     search: [''],
  //     selectedCategories: this.fb.array([]),
  //     newCategory: this.fb.group({
  //       name: [''],
  //       parent: [''],
  //     }),
  //   });
  // }

  addTagsForm() {
    this.tagsForm = this.fb.group({
      tagInput: [''],
      tags: [this.data?.item?.tags?.tags],
    });
  }
  // private initializeCategoryControls(): void {
  //   const selectedCategories = this.categoryForm.get('selectedCategories') as FormArray;
  //   selectedCategories.clear();

  //   this.categories.forEach((category) => {
  //     selectedCategories.push(new FormControl(false));
  //     if (category.subCategories) {
  //       category.subCategories.forEach((sub) => {
  //         selectedCategories.push(new FormControl(false));
  //         if (sub.subCategories) {
  //           sub.subCategories.forEach(() => {
  //             selectedCategories.push(new FormControl(false));
  //           });
  //         }
  //       });
  //     }
  //   });
  // }

  // get selectedCategories(): FormArray {
  //   return this.categoryForm.get('selectedCategories') as FormArray;
  // }

  get newCategoryForm(): FormGroup {
    return this.categoryForm.get('newCategory') as FormGroup;
  }

  onSearch(): void {
    //console.log('Search Query:', this.categoryForm.get('search')?.value);
    // Add search logic here
  }
  getCategoryLabel(index: number): string {
    // Simplified way to show category name from index
    const flatList: string[] = [];
    this.categories.forEach((c) => {
      flatList.push(c.name);
      c.subCategories?.forEach((sub) => {
        flatList.push('— ' + sub.name);
        sub.subCategories?.forEach((subSub) => flatList.push('—— ' + subSub.name));
      });
    });
    return flatList[index] || 'Category ' + index;
  }
  addNewCategory(): void {
    const newCat = this.newCategoryForm.value;
    //console.log('New Category:', newCat);
  }

  // Tags start

  addTag() {
    //console.log('this.tagsForm.value==>', this.tagsForm.value);

    const tagValue = this.tagsForm.value.tagInput?.trim();
    //console.log('tagValue ==>', tagValue);

    if (tagValue) {
      const currentTags = this.tagsForm.value.tags || [];
      const newTags = [
        ...currentTags,
        ...tagValue
          .split(',')
          .map((t: any) => t.trim())
          .filter(Boolean),
      ];
      this.tagsForm.patchValue({ tags: newTags, tagInput: '' });
    }
  }

  // ✅ Remove tag by index
  removeTag(index: number) {
    const currentTags = [...this.tagsForm.value.tags];
    currentTags.splice(index, 1);
    this.tagsForm.patchValue({ tags: currentTags });
  }

  // ✅ Select from most used tags
  selectTag(tag: string) {
    const currentTags = this.tagsForm.value.tags || [];
    if (!currentTags.includes(tag)) {
      this.tagsForm.patchValue({ tags: [...currentTags, tag] });
    }
  }
  onThumbSelect(event: any) {
    const file = event.target.files[0];
    this.thumbFile = file;

    // Create image preview
    const reader = new FileReader();
    reader.onload = () => {
      this.thumbPreview.push(reader.result as string);
    };
    reader.readAsDataURL(file);
  }

  // media upload photo fnc
  onFileSelect(event: any) {
    // const file = event.target.files[0];
    for (let i = 0; i < event.target.files.length; i++) {
      const file = event.target.files[i];
      if (!file) return;
      this.selectedFile.push(file);
      //console.log('this.selectedFile===>', this.selectedFile);

      // Preview if needed
      const reader = new FileReader();
      reader.onload = () => {
        // this.thumbPreview = reader.result as string;
        this.thumbGallery.push(reader.result as string);
        this.cd.detectChanges();
      };

      const element = this.selectedFile[i];
      reader.readAsDataURL(element);
    }
    // Call upload immediately
    // this.uploadImage();
    //console.log(' this.thumbGallery===>', this.thumbGallery);
  }
  onFileProductDescriptionGallery(event: any) {
    // const file = event.target.files[0];
    for (let i = 0; i < event.target.files.length; i++) {
      const file = event.target.files[i];
      if (!file) return;
      this.selectProductDesciptionImageGallery.push(file);
      //console.log('this.selectedFile===>', this.selectedFile);

      // Preview if needed
      const reader = new FileReader();
      reader.onload = () => {
        // this.thumbPreview = reader.result as string;
        this.prodDescriptionImageGallery.push(reader.result as string);
        this.cd.detectChanges();
      };

      const element = this.selectProductDesciptionImageGallery[i];
      reader.readAsDataURL(element);
      this.cd.detectChanges();

    }
    // Call upload immediately
    // this.uploadImage();
    //console.log(' this.thumbGallery===>', this.thumbGallery);
  }
  onFileSelectThumb(event: any) {
    const file = event.target.files[0];
    if (!file) return;
    // const file = event.target.files[0];
    // this.selectedFile.push(file);
    this.selectedThumbImg = file;

    // Preview if needed
    const reader = new FileReader();
    reader.onload = () => {
      // this.thumbPreview = reader.result as string;
      this.thumbPreview = reader.result as string;
      this.cd.detectChanges();
    };
    reader.readAsDataURL(file);
    // Call upload immediately
    // this.uploadImage();
  }
  uploadImage() {
    if (!this.selectedThumbImg) return;
    const formData = new FormData();
    // for (let i = 0; i < this.selectedFile.length; i++) {
    // const element = this.selectedFile[i];
    formData.append('files', this.selectedThumbImg, this.selectedThumbImg.name);
    formData.append('module', 'product');
    formData.append('module_id', 'gallery');
    formData.append('type', 'gallery');
    // }
    // Add other parameters if needed
  }

  onGallerySelect(event: any) {
    this.galleryFiles = event.target.files;
  }
  updateProduct() {
    console.log('this.data?.id===>', this.data?.item?.id);

    this.finalpriceObj = this.priceSection.value;
    this.finalpriceObj.lastUpdatedDate = new Date().getTime();

    // priceSection.priceDateStart = new Date(this.priceSection.value.priceDateStart).getTime();
    // priceSection.priceDateEnd = new Date(this.priceSection.value.priceDateEnd).getTime();
    let mediaSectionPayload = {
      thumbFile: this.thumbFile,
      galleryFiles: this.galleryFiles,
    };
    let finalData: any = {
      category_id: this.parentId,
      media: mediaSectionPayload,
      title: this.productDetails.value.productTitle,
      description: this.productDetails.value.productDescription,
      shortDescription: this.productDetails.value.shortDescription,
      features: this.productDetails.value.features,
      inventory: this.productInventrySection.value,
      price_data: this.finalpriceObj,
      shipping_info: this.shippingInfoSection.value,
      shipping_config: this.shippingConfigForm.value,
      offer: this.offerForm.value,
      seo: this.seoForm.value,
      tags: this.tagsForm.value,
      flags: this.productStatus,
      product_details: this.productDetails.value,
      visibility: {
        status: this.productMultipleOptionForm.value.status,
        publishDate: this.productMultipleOptionForm.value.publishDate,
        visibility: this.productMultipleOptionForm.value.visibility,
      },
      attributes: {
      }
    };
    console.log('this.permaLink==>',this.permaLink);
    
    finalData.product_details.permaLink = this.permaLink;
    let url = `products/${this.data?.item?.id}`
    this.dataService
      .put(finalData, url)
      .pipe(
        catchError((err) => {
          console.error('Error:', err);
          setTimeout(() => {
            // this.globalService.showMsgSnackBar(err);
          }, 100);
          return of(err);
        })
      )
      .subscribe((res: any) => {
        //console.log('Response:', res);
        if (res.error) {
          this.globalService.showMsgSnackBar(res.error);
          return;
        } else if (res.success == true) {
          let id = res.data.data.id;
          //console.log('this.selectedThumbImg==>', this.selectedThumbImg);

          if (this.selectedThumbImg != undefined) {
            const formDataThumb = new FormData();
            // for (let i = 0; i < this.selectedFile.length; i++) {
            // const element = this.selectedFile[i];
            formDataThumb.append('files', this.selectedThumbImg, this.selectedThumbImg.name);
            formDataThumb.append('module', 'product');
            formDataThumb.append('module_id', id);
            formDataThumb.append('type', 'thumbnail');
            this.callUploadnediaSection(formDataThumb);
          }
          if (this.selectProductDesciptionImageGallery?.length) {
            for (const file of this.selectProductDesciptionImageGallery) {
              const formData = new FormData();
              formData.append('files', file);
              formData.append('module', 'product');
              formData.append('module_id', id);
              formData.append('type', 'photoDescriptionImageGallery');
              this.callUploadnediaSection(formData);
            }
          }
          if (this.selectedFile?.length) {
            for (const file of this.selectedFile) {
              const formData = new FormData();
              formData.append('files', file);
              formData.append('module', 'product');
              formData.append('module_id', id);
              formData.append('type', 'gallery');

              this.callUploadnediaSection(formData);
            }


            //   for (let i = 0; i < this.selectedFile.length; i++) {
            //   const element = this.selectedFile[i];

            //   const formData = new FormData();   // IMPORTANT: create new for each file

            //   formData.append("files", element, element.name);
            //   formData.append("module", "product");
            //   formData.append("module_id", id);
            //   formData.append("type", "gallery");
            // //console.log('formData==>',formData);

            //   this.callUploadnediaSection(formData);
            // }
          }
          setTimeout(() => {
            this.globalService.showMsgSnackBar(res);
            this.activeModal.close('success');
          }, 100);
        }
        // this.addCategory.reset();
        // this.imagePreview = '';
        // this.imageFile = null;
        // this.getCategoryList();
      });

  }
  getProductDetails() {
    //console.log('productDetails==>', this.productDetails.value);

    let priceSection = this.priceSection.value;
    // priceSection.priceDateStart = new Date(this.priceSection.value.priceDateStart).getTime();
    // priceSection.priceDateEnd = new Date(this.priceSection.value.priceDateEnd).getTime();
    // media payload
    let mediaSectionPayload = {
      thumbFile: this.thumbFile,
      galleryFiles: this.galleryFiles,
    };
    let finalData: any = {
      category_id: this.parentId,
      media: mediaSectionPayload,
      title: this.productDetails.value.productTitle,
      description: this.productDetails.value.productDescription,
      shortDescription: this.productDetails.value.shortDescription,
      features: this.productDetails.value.features,
      // productStatus:this.productDetails.value.productStatus,
      inventory: this.productInventrySection.value,
      price_data: this.finalpriceObj,
      shipping_info: this.shippingInfoSection.value,
      shipping_config: this.shippingConfigForm.value,
      offer: this.offerForm.value,
      seo: this.seoForm.value,
      tags: this.tagsForm.value,
      flags: this.productStatus,
      product_details: this.productDetails.value,
      // visibility:this.productMultipleOptionForm.value,
      visibility: {
        status: this.productMultipleOptionForm.value.status,
        publishDate: this.productMultipleOptionForm.value.publishDate,
        visibility: this.productMultipleOptionForm.value.visibility,
      },
      attributes: {
        // product_details: this.productDetails.value

        //      productDetailsObj : {
        //   productDetails :this.productDetails.value.productTitle,
        //   shortDescription:this.productDetails.value.shortDescription,
        //   productDescription: this.productDetails.value.description,
        //   features:this.productDetails.value.features,
        //   productStatus: [[]],
        // }
      }
    };
    console.log('this.permaLink===>',this.permaLink);
    
    finalData.product_details.permaLink = this.permaLink;
    this.dataService
      .post(finalData, 'products')
      .pipe(
        catchError((err) => {
          console.error('Error:', err);
          setTimeout(() => {
            // this.globalService.showMsgSnackBar(err);
          }, 100);
          return of(err);
        })
      )
      .subscribe((res: any) => {
        //console.log('Response:', res);
        if (res.error) {
          this.globalService.showMsgSnackBar(res.error);
          return;
        } else if (res.success == true) {
          // let id = res.data.id;
          let id = res.data.data.id;
          //console.log('this.selectedThumbImg==>', this.selectedThumbImg);

          if (this.selectedThumbImg != undefined) {
            const formDataThumb = new FormData();
            // for (let i = 0; i < this.selectedFile.length; i++) {
            // const element = this.selectedFile[i];
            formDataThumb.append('files', this.selectedThumbImg, this.selectedThumbImg.name);
            formDataThumb.append('module', 'product');
            formDataThumb.append('module_id', id);
            formDataThumb.append('type', 'thumbnail');
            this.callUploadnediaSection(formDataThumb);
          }
          if (this.selectProductDesciptionImageGallery?.length) {
            for (const file of this.selectProductDesciptionImageGallery) {
              const formData = new FormData();
              formData.append('files', file);
              formData.append('module', 'product');
              formData.append('module_id', id);
              formData.append('type', 'photoDescriptionImageGallery');
              this.callUploadnediaSection(formData);
            }
          }
          if (this.selectedFile?.length) {
            for (const file of this.selectedFile) {
              const formData = new FormData();
              formData.append('files', file);
              formData.append('module', 'product');
              formData.append('module_id', id);
              formData.append('type', 'gallery');

              this.callUploadnediaSection(formData);
            }


            //   for (let i = 0; i < this.selectedFile.length; i++) {
            //   const element = this.selectedFile[i];

            //   const formData = new FormData();   // IMPORTANT: create new for each file

            //   formData.append("files", element, element.name);
            //   formData.append("module", "product");
            //   formData.append("module_id", id);
            //   formData.append("type", "gallery");
            // //console.log('formData==>',formData);

            //   this.callUploadnediaSection(formData);
            // }
          }
          setTimeout(() => {
            this.globalService.showMsgSnackBar(res);
            this.resetProductForm();
          }, 100);
        }
        // this.addCategory.reset();
        // this.imagePreview = '';
        // this.imageFile = null;
        // this.getCategoryList();
      });

    //   //console.log('thumbFile',this.thumbFile);  // FileList
    //   //console.log('galleryFiles',this.galleryFiles);  // FileList
    // //console.log('this.priceSection.value.priceDateStart==>',this.priceSection.value);
    // // price start and end time
    //   const priceDateStart = new Date(this.priceSection.value.priceDateStart).getTime();
    //   const priceDateEnd = new Date(this.priceSection.value.priceDateEnd).getTime();

    // media payload
    // let mediaSectionPayload = {
    // thumbFile:this.thumbFile,
    // galleryFiles:this.galleryFiles
    // }

    //   //console.log('productDetails==>',this.productDetails.value);
    //   //console.log('productOptionData==>',this.productOptionData.value);
    // //console.log('submitProductMultipleOptionForm==>',this.productMultipleOptionForm.value);
    // // //console.log('New Category:', this.categoryForm.get('newCategory')?.value);
    // //console.log('New Category:', this.newCategoryForm.value);
    // //console.log('this.tagsForm==>',this.tagsForm.value.tags);
    // //console.log('selectedCategories==>',this.selectedCategories.value);

    // tagsform value
    // const tagsArray = this.tagsForm.value.tags;
    // const tagsString = tagsArray.join(', ');
    // //console.log('tagsString',tagsString);



  }

  callUploadnediaSection(formData: any) {
    //console.log('formData==>', formData);

    this.dataService
      .postForm('media/upload', formData)
      .pipe(
        catchError((err) => {
          console.error('Error:', err);
          //     setTimeout(() => {
          //   this.globalService.showMsgSnackBar(err);
          // }, 100);
          return of(null);
        })
      )
      .subscribe((res: any) => {
        //console.log('Response:', res);
        // this.getCategoryList();
        // setTimeout(() => {
        //   this.globalService.showMsgSnackBar(res);
        // }, 100);
      });
  }

  // get categories
  getCategoryList() {
    this.categoryListData = {};
    this.dataService
      .get('categories')
      .pipe(
        catchError((err) => {
          console.error('Error:', err);
          return of(null);
        })
      )
      .subscribe((res: any) => {
        let filteredData = [];
        //console.log('Response:', res);
        if (res.data) {
          for (let i = 0; i < res.data.length; i++) {
            const element = res.data[i];
            //console.log('element==>', element.thumbnail);
            if (element?.thumbnail != null) {
              //console.log('environment.API_URL==>', environment.API_URL);
              element.thumbnail = environment.DOMAIN + '/' + element.thumbnail;
            }
            if (this.data?.item) {

              if (element.id == this.data?.item?.category?.id) {
                element.checked = true;
              }
              else {
                element.checked = false;

              }
            }
            filteredData.push(element);
          }
          this.categoryListData.categories = filteredData;
          // Assign categories
          // this.categoryListData.categories.forEach((cat: any) => {
          //   cat.checked = this.data.category.id == cat.id;
          // });

        }
        //console.log('categoryListData==>', this.categoryListData);
        // this.dataSource = this.categoryListData;
        this.cd.detectChanges();
        // this.categoryListData = res.data;
      });
  }

  slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()                              // remove start/end spaces
    .replace(/[–—]/g, '-')               // replace long dashes with normal dash
    .replace(/[^a-z0-9\s-]/g, '')         // remove special characters
    .replace(/\s+/g, '-')                 // spaces → dash
    .replace(/-+/g, '-')                  // multiple dashes → single dash
    .replace(/^-+|-+$/g, '');             // remove dash from start/end
}

  createPermalink() {
// Onchange 
//     const cleanedTitle =
//   this.specialCharacterHelper.specialCharacterChecker(
//     this.productDetails.value.productTitle,
//     {
//       replaceWithSpace: ['-'],
//       remove: ['&','*','('],
//       capitalize: true
//     }
//   );
//   this.productDetails.patchValue({
//   productTitle: cleanedTitle
// });

// onblur 
  const control = this.productDetails.get('productTitle');
  if (!control) return;

  const cleanedTitle =
    this.specialCharacterHelper.specialCharacterChecker(
      control.value,
      // {
      //   replaceWithSpace: ['-'],
      //   remove: ['&', '*', '('],
      //   capitalize: true
      // }
      {
        allowOnly: ['|'],
    replaceWithSpace: ['-'],
    capitalize: true
      }
    );

  control.setValue(cleanedTitle, { emitEvent: false });
    // this.specialCharacterHelper.specialCharacterChecker( 'adjustable--cow|-anti kick',{replaceWithSpace: ['-'],remove: ['|'],capitalize: true});
    // this.productDetails.value.productTitle = this.slugToTitle(this.productDetails.value.productTitle);
    // let permaLinkValue = this.productDetails.value.productTitle.contains(' ')
    const formatted = this.productDetails.value.productTitle.replace(/\s+/g, '-').toLowerCase();
    const cleanSlug = this.slugify(formatted);
    let limitedSlug = cleanSlug.slice(0, 25);
    limitedSlug = limitedSlug.replace(/-+$/g, '');
    this.permaLink = limitedSlug;
    // this.permaLink = cleanSlug;
    this.seoForm.patchValue({ slugText: formatted });
    this.cd.detectChanges();
  }
  enableInput() {
    this.isInputShow = true;
  }
  getUpdatedValue(event: any) {
    //console.log('event==>', event.target.value);
    let value = event.target.value.replace(/\s+/g, '-').toLowerCase();
    this.permaLink = value;
  }
  onPermalinkBlur(event: any) {
    const value = event.target.textContent.trim().replace(/\s+/g, '-').toLowerCase();
    this.permaLink = value;
    this.cd.detectChanges();
  }
  permalinkAction(action: String) {
    this.isInputShow = false;
    if (action == 'cancel') {
      // this.permaLink = '';
    }
  }
  discountPriceChange() {
    const regularPrice = this.priceSection.value.regularPrice;
    const salePrice = this.priceSection.value.salePrice;
    const discountType = this.priceSection.value.discountType;

    // Check if discount is greater than or equal to regular price (only for Flat discount)
    if (discountType === 'Flat' && regularPrice && salePrice && salePrice >= regularPrice) {
      this.wrongDiscount = true;
    } else {
      this.wrongDiscount = false;
    }
    setTimeout(() => {
      this.getGstDiscount();
    }, 1000);
  }
  onDiscountTypeChange() {
    const discountType = this.priceSection.value.discountType;
    this.updateDiscountValidators(discountType);
    this.discountPriceChange();
  }

  updateDiscountValidators(type: string) {
    const salePriceControl = this.priceSection.get('salePrice');

    if (type === 'Discount') {
      // For percentage, min 0 and max 100
      salePriceControl?.setValidators([Validators.min(0), Validators.max(100)]);
    } else {
      // For flat amount, just min 0
      salePriceControl?.setValidators([Validators.min(0)]);
    }

    salePriceControl?.updateValueAndValidity();

    this.cd.detectChanges();
  }


  removeGalleryImage(index: number) {
    // Remove from the preview array
    this.thumbGallery.splice(index, 1);

    // Remove from the selected files array
    if (this.selectedFile && this.selectedFile.length > index) {
      this.selectedFile.splice(index, 1);
    }

    // Update the file input with remaining files
    if (this.galleryInput) {
      if (this.selectedFile.length === 0) {
        // Clear input if no files remain
        this.galleryInput.nativeElement.value = '';
      } else {
        // Rebuild the FileList with remaining files
        const dataTransfer = new DataTransfer();
        this.selectedFile.forEach((file) => {
          dataTransfer.items.add(file);
        });
        this.galleryInput.nativeElement.files = dataTransfer.files;
      }
    }

    // Trigger change detection
    this.cd.detectChanges();
  }
  removeProductDescriptionGalleryImage(index: number) {
    // Remove from the preview array
    this.prodDescriptionImageGallery.splice(index, 1);

    // Remove from the selected files array
    if (this.selectProductDesciptionImageGallery && this.selectProductDesciptionImageGallery.length > index) {
      this.selectProductDesciptionImageGallery.splice(index, 1);
    }

    // Update the file input with remaining files
    if (this.descriptionImageGallery) {
      if (this.selectProductDesciptionImageGallery.length === 0) {
        // Clear input if no files remain
        this.descriptionImageGallery.nativeElement.value = '';
      } else {
        // Rebuild the FileList with remaining files
        const dataTransfer = new DataTransfer();
        this.selectProductDesciptionImageGallery.forEach((file) => {
          dataTransfer.items.add(file);
        });
        this.descriptionImageGallery.nativeElement.files = dataTransfer.files;
      }
    }

    // Trigger change detection
    this.cd.detectChanges();
  }
  //    uploadPrdouctDescriptionImageGallery(){
  //  if (this.selectedFile?.length) {
  //               for (const file of this.selectedFile) {
  //                 const formData = new FormData();
  //                 formData.append('files', file);
  //                 formData.append('module', 'product');
  //                 formData.append('module_id', id);
  //                 formData.append('type', 'gallery');

  //                 this.callUploadnediaSection(formData);
  //               }
  //             }
  //    }

  resetProductForm(){
  this.productDetails.reset();
this.productOptionData.reset();
this.productMultipleOptionForm.reset();
this.tagsForm.reset();
this.productMediaSection.reset();
this.productInventrySection.reset();
this.priceSection.reset(); 
this.shippingInfoSection.reset();
 this.productAttributesForm.reset();
 this.shippingConfigForm.reset();
 this.offerForm.reset();
 this.seoForm.reset();
  }
}
