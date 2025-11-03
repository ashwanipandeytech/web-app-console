import { Component } from '@angular/core';
import {Sidebar} from "../../layout/sidebar/sidebar";
import {Header} from "../../layout/header/header";

@Component({
  selector: 'app-all-products',
  imports: [Sidebar, Header],
  templateUrl: './all-products.html',
  styleUrl: './all-products.scss'
})
export class AllProducts {

}
