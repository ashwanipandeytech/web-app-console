import { JsonPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { DataService } from 'shared-lib';

@Component({
  selector: 'web-footer',
  imports: [JsonPipe],
  templateUrl: './footer.html',
  styleUrl: './footer.scss'
})
export class Footer {
 public dataService=inject(DataService);
}
