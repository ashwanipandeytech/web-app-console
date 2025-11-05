import { Routes } from '@angular/router';
import { PageContentResolver } from 'shared-lib';
import { Login } from './auth/login/login';
import { Dashboard } from './modules/dashboard/dashboard';
import { Customers } from './modules/customers/customers';
import { AddCustomer } from './modules/customers/add-customer/add-customer';
import { AllProducts } from './modules/products/all-products';
import { Order } from './modules/order/order';
import { Category } from './modules/category/category';

export const routes: Routes = [
    // {
        
    //     path: '',
    //     pathMatch: 'full',
    //     loadComponent: () => import('./host-outlet/host.component').then(m => m.HostOutletComponent),
    //     resolve: {
    //         pageData: PageContentResolver
    //     }
    // },
    // {
    //     path: 'fotobuch',  
    //     pathMatch: 'full',     
    //     loadComponent: () => import('./host-outlet/host.component').then(m => m.HostOutletComponent),
    //     resolve: {
    //         pageData: PageContentResolver
    //     }
    // },
    
    {
        path: '',
        loadComponent: () =>
        import('./auth/login/login').then(c => c.Login)
    },
    {
        path: 'dashboard',
        component: Dashboard
    },
    {
        path: 'all-customers',
        component: Customers
    },
    {
        path: 'all-products',
        component: AllProducts
    },
    {
        path: 'add-product',
        component: AddCustomer
    },
    {
        path: 'orders',
        component: Order
    },
    {
        path: 'category',
        component: Category
    },
   
];
