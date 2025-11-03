import { Component } from '@angular/core';
import {Sidebar} from "../../../layout/sidebar/sidebar";
import {Header} from "../../../layout/header/header";

@Component({
  selector: 'app-add-customer',
  imports: [Sidebar, Header],
  templateUrl: './add-customer.html',
  styleUrl: './add-customer.scss'
})
export class AddCustomer {

}
