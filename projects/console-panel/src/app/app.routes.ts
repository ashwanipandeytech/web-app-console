import { Routes } from '@angular/router';
import { PageContentResolver } from 'shared-lib';
import { Login } from './auth/login/login';
import { Dashboard } from './modules/dashboard/dashboard';
import { Customers } from './modules/customers/customers';
import { AddProduct } from './modules/products/add-product/add-product';
import { AllProducts } from './modules/products/all-products';
import { Order } from './modules/order/order';
import { Category } from './modules/category/category';
import { authGuard } from './app.guard';
import { LayoutSettingsComponent } from './modules/layout-settings/layout-settings.component';
import { PageList } from './modules/settings/pages.component';
import { AddPage } from './modules/settings/add';
import { EditPage } from './modules/settings/edit';

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
        import('./auth/login/login').then(c => c.Login),
        canActivate: [authGuard]
    },
    {
        path: 'login',
        loadComponent: () =>
        import('./auth/login/login').then(c => c.Login),
        canActivate: [authGuard]
    },
    {
        path: 'dashboard',
        component: Dashboard,
        canActivate: [authGuard]
    },
    {
        path: 'all-customers',
        component: Customers,
        canActivate: [authGuard]
    },
    {
        path: 'all-products',
        component: AllProducts,
        canActivate: [authGuard]
    },
    {
        path: 'add-product',
        component: AddProduct,
        canActivate: [authGuard]
    },
    {
        path: 'orders',
        component: Order,
        canActivate: [authGuard]
    },
    {
        path: 'category',
        component: Category,
        canActivate: [authGuard]
    },
      {
        path: 'settings',
        component: LayoutSettingsComponent,
        canActivate: [authGuard]
    },
     {
        path: 'pages',
        component: PageList,
        canActivate: [authGuard]
    },
    
    {
        path: 'add-page',
        component: AddPage,
        canActivate: [authGuard]
    },

      {
       path: 'edit-page/:id',
  component: EditPage,
  canActivate: [authGuard]
    }
   
];
