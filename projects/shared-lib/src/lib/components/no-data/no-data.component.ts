import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-no-data',
  templateUrl: './no-data.component.html',
  standalone: true,
  imports: [CommonModule],
  styleUrls: ['./no-data.component.scss']
})
export class NoDataComponent implements OnInit {
 @Input() title: string = 'No Data Available';
  @Input() message: string =
    'We couldn’t find any records to display at the moment.';
  @Input() showAction: boolean = false;
  @Input() actionText: string = 'Refresh';
  constructor() { }

  ngOnInit() {
  }

}
