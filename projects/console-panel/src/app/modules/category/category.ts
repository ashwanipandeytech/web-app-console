import { Component } from '@angular/core';
import {Sidebar} from "../../layout/sidebar/sidebar";
import {Header} from "../../layout/header/header";

@Component({
  selector: 'app-category',
  imports: [Sidebar, Header],
  templateUrl: './category.html',
  styleUrl: './category.scss'
})
export class Category {

}
