import { Component } from '@angular/core';
import {Sidebar} from "../../layout/sidebar/sidebar";
import {Header} from "../../layout/header/header";

@Component({
  selector: 'app-order',
  imports: [Sidebar, Header],
  templateUrl: './order.html',
  styleUrl: './order.scss'
})
export class Order {

}
