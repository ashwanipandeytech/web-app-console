import { Routes } from '@angular/router';
import { PageContentResolver } from 'shared-lib';
import { Auth } from './auth/auth';
import { LandingPage } from './landing-page/landing-page';
import { ProductDetail } from './product-detail/product-detail';
import { Cart } from './cart/cart';

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
    { path: '', component: LandingPage },
    { path: 'login', component: Auth },
    { path: 'product-detail/:id', component: ProductDetail },
    { path: 'cart', component: Cart },

   
];
