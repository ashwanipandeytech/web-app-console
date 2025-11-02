import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { environment } from '#environments';
import { PageContentFetcher } from 'shared-lib';
@Component({
  selector: 'console-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('conceptfit');
  
  constructor(){
   // console.info('Environment', environment);
  }
}
