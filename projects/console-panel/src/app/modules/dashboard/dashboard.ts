import { Component } from '@angular/core';
import {Sidebar} from "../../layout/sidebar/sidebar";
import {Header} from "../../layout/header/header";
@Component({
  selector: 'app-dashboard',
  imports: [Sidebar, Header],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class Dashboard {

}
