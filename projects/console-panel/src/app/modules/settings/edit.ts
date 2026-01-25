
import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { catchError, of } from 'rxjs';
import { DataService } from 'shared-lib';
import { GlobalService } from '../../global.service';

import { QuillModule } from 'ngx-quill';
import Quill from 'quill';
import { ImageHandler, Options } from 'ngx-quill-upload';
import htmlEditButton from 'quill-html-edit-button';
Quill.register('modules/htmlEditButton', htmlEditButton);
Quill.register('modules/imageHandler', ImageHandler);



@Component({
  selector: 'app-editpage',
  templateUrl: './edit.html',
  imports: [FormsModule, CommonModule, QuillModule],
  styleUrls: ['./edit.scss'],
  standalone: true
})
export class EditPage implements OnInit {
  public dataService: any = inject(DataService);

  private route: ActivatedRoute = inject(ActivatedRoute);
  private router: Router = inject(Router);
  settings: any = FormGroup;
  newPage: any
  modules = {};
  options: any


  constructor(private cdr: ChangeDetectorRef, private globalService: GlobalService) {

  }


  ngOnInit() {

    this.modules = {

      htmlEditButton: {
        debug: true, // Developers love logs
        msg: "Edit HTML", // Tooltip
        okText: "Save",
      },
      toolbar: [
        // --- TEXT STYLE ---
        [{ 'font': [] }, { 'size': ['small', false, 'large', 'huge'] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'color': [] }, { 'background': [] }],
         [{ 'script': 'sub' }, { 'script': 'super' }],

        // --- HEADER & QUOTES ---
        [{ 'header': 1 }, { 'header': 2 }, 'blockquote'],

        // --- LISTS & INDENTS ---
        [{ 'list': 'ordered' }, { 'list': 'bullet' }],
        [{ 'indent': '-1' }, { 'indent': '+1' }],
        [{ 'direction': 'rtl' }],

        // --- ALIGNMENT ---
        [{ 'align': [] }],

        // --- LINKS & MEDIA ---
        ['link', 'image', 'formula'],
        ['htmlEditButton'],
        // --- UTILS ---
        ['clean']
      ],
      imageHandler: {
        upload: (file: File) => {

          return new Promise((resolve, reject) => {

            // 1. Validation Logic
            if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
              console.info('Unsupported type');
              return reject('Unsupported type');
            }
            // if (file.size > 1000000) {
            //     console.info('Size');
            //   return reject('Size too large (Max 1MB)');
            // }

            // 2. Call the Service
            const formData = new FormData();
            formData.append('files', file);
            formData.append('type', 'pages');

            this.dataService
              .postForm('gallery', formData)
              .pipe(
                catchError((err) => {
                  return of(null);
                })
              )
              .subscribe((res: any) => {
                console.log('Response:', res);
                resolve(res.data[0].url);

              });

          });
        },
        accepts: ['png', 'jpg', 'jpeg', 'jfif']
      } as Options,




    };
    let slug = this.route.snapshot.params['id']

    this.dataService.get('pages/' + slug)
      .pipe(
        catchError(err => {
          this.globalService.showMsgSnackBar(err);
          console.error('Error:', err);
          return of(null);
        })
      )
      .subscribe((res: any) => {
        // //console.log('Response:', res.data);
        if (res.success) {
          this.newPage = res.data.settings;

          this.cdr.detectChanges()
        }

      });

  }


  handleImageUpload(file: any) {
    console.info('files', file)

    // 2. Call the Service
    const formData = new FormData();
    formData.append('files', file);
    formData.append('type', 'pages');
    console.info('herere test', formData)
    this.dataService
      .postForm('gallery', formData)
      .pipe(
        catchError((err) => {
          return of(null);
        })
      )
      .subscribe((res: any) => {
        console.log('Response:', res);
        // resolve(res.data[0].url);

      });

    return

    return new Promise((resolve, reject) => {

      // 1. Validation Logic
      if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
        console.info('Unsupported type');
        return reject('Unsupported type');
      }
      if (file.size > 1000000) {
        console.info('Size');
        return reject('Size too large (Max 1MB)');
      }

      // 2. Call the Service
      const formData = new FormData();
      formData.append('files', file);
      formData.append('type', 'pages');
      console.info('herere test', formData)
      this.dataService
        .postForm('gallery', formData)
        .pipe(
          catchError((err) => {
            return of(null);
          })
        )
        .subscribe((res: any) => {
          console.log('Response:', res);
          resolve(res.data[0].url);

        });

    });
  }

  updatePage() {
    console.info('this.newPage', this.newPage)
    let payload = {
      settings_name: this.newPage.slug,
      settings: this.newPage
    }
    this.dataService.post(payload, 'pages')
      .pipe(
        catchError(err => {
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
