import { Routes } from '@angular/router';
import { PageContentResolver } from 'shared-lib';
import { LandingPage } from './landing-page/landing-page';
import { ContactUs } from './pages/contact-us/contact-us';
import { AboutUs } from './pages/about-us/about-us';
import { ProductSidebar } from './pages/product-sidebar/product-sidebar';
import { Cart } from './cart/cart';
import { Checkout } from './cart/checkout/checkout';
import { Login } from './auth/login/login';
import { Terms } from './terms/terms';
import { Privacy } from './privacy/privacy';
import { UserProfile } from './account/user-profile/user-profile';
import { Wishlist } from './account/wishlist/wishlist';
import { Compaire } from './account/compaire/compaire';
import { Category } from './pages/category/category';
import { ProductInfo } from './pages/product-info/product-info';
import { authGuard } from './app.guard';

export const routes: Routes = [
    {
        path: '',
        component: LandingPage,
        
    },
     {
        path: 'landing',
        component: LandingPage,
        
    },
    {
        path: 'login',
        component: Login,
        canActivate: [authGuard]
         
    },
    {
        path: 'about-us',
        component: AboutUs,
         
    },
    {
        path: 'category',
        component: Category,
         
    },
    {
        path: 'product-sidebar',
        component: ProductSidebar,
         
    },
        {
        path: 'product-info/:id',
        component: ProductInfo,
         
        },
    {
        path: 'cart',
        component: Cart,
         
    },   
    {
        path: 'user-profile',
        component: UserProfile,
        canActivate: [authGuard]
         
    },
    {
        path: 'wishlist',
        component: Wishlist,
         
    },
    {
        path: 'compaire',
        component: Compaire,
         
    },
    {
        path: 'checkout',
        component: Checkout,
         
    },
    {
        path: 'terms',
        component: Terms,
         
    },
    {
        path: 'privacy',
        component: Privacy,
         
    },
    {
        path: 'contact-us',
        component: ContactUs,
         
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
