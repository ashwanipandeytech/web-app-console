import { Routes } from '@angular/router';
import { PageContentResolver } from 'shared-lib';
import { LandingPage } from './landing-page/landing-page';
import { ContactUs } from './pages/contact-us/contact-us';
import { AboutUs } from './pages/about-us/about-us';
import { ProductSidebar } from './pages/product-sidebar/product-sidebar';
import { Cart } from './cart/cart';
import { Checkout } from './cart/checkout/checkout';
import { Login } from './auth/login/login';

export const routes: Routes = [
    {
        path: '',
        component: LandingPage
    },
    {
        path: 'login',
        component: Login
    },
    {
        path: 'about-us',
        component: AboutUs
    },
    {
        path: 'product-sidebar',
        component: ProductSidebar
    },
    {
        path: 'cart',
        component: Cart
    },
    {
        path: 'checkout',
        component: Checkout
    },
    {
        path: 'contact-us',
        component: ContactUs
    }
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

   
];
