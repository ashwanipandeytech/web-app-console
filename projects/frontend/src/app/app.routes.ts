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
import { authGuard } from './app.guard';
import { ProductDetailCommon} from 'shared-lib/components/product-info/product-info';
import { ProductSidebarCommon} from 'shared-lib/components/product-sidebar/product-sidebar';
import { CategoryCommon} from 'shared-lib/components/category/category';


import { CartCommon } from 'shared-lib/components/cart/cart';
import { Thankyou } from './pages/thankyou/thankyou';

export const routes: Routes = [
    {
        path: '',
        component: Login,
        canActivate: [authGuard]
        
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
        component: CategoryCommon,
         
    },
    // {
    //     path: 'product-sidebar',
    //     component: ProductSidebar,
         
    // },
      {
        path: 'product-sidebar',
        component: ProductSidebarCommon,
         
    },
        // {
        // path: 'product-info/:id',
        // component: ProductInfo,
         
        // },
         {
       path: 'product-details/:id',
        component: ProductDetailCommon,
         
        },
    // {
    //     path: 'cart',
    //     component: Cart,
         
    // },   
      {
        path: 'cart',
        component: CartCommon,
         
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
         
    },
  {
        path: 'thank-you',
        component: Thankyou,
         
    },
    {
        path: 'host',
        pathMatch: 'full',
        loadComponent: () => import('./host-outlet/host.component').then(m => m.HostOutletComponent),
        resolve: {
            pageData: PageContentResolver
        }
    },
    // {
    //     path: 'fotobuch',  
    //     pathMatch: 'full',     
    //     loadComponent: () => import('./host-outlet/host.component').then(m => m.HostOutletComponent),
    //     resolve: {
    //         pageData: PageContentResolver
    //     }
    // },

   
];
