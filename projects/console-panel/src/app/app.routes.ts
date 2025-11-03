import { Routes } from '@angular/router';
import { PageContentResolver } from 'shared-lib';
import { Login } from './auth/login/login';
import { Dashboard } from './modules/dashboard/dashboard';

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
        loadComponent: () =>
        import('./modules/customers/customers').then(c => c.Customers)
    },
    {
        path: 'add-customer',
        loadComponent: () =>
        import('./modules/customers/add-customer/add-customer').then(c => c.AddCustomer)
    },
   
];
