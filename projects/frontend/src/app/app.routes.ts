import { Routes } from '@angular/router';
import { PageContentResolver } from 'shared-lib';
import { LandingPage } from 'shared-lib/components/landing-page/landing-page';
import { ContactUs } from 'shared-lib/pages/contact-us/contact-us.component';
import { AboutUs } from 'shared-lib';
import { Checkout } from 'shared-lib/components/cart/checkout/checkout';
import { Login } from 'shared-lib/components/auth/login/login';
import { Terms } from 'shared-lib';
import { Privacy } from 'shared-lib';
import { UserProfile } from 'shared-lib/components/account/user-profile/user-profile';
import { Wishlist } from 'shared-lib/components/account/wishlist/wishlist';
import { Compaire } from 'shared-lib/components/account/compaire/compaire';
import { authGuard } from './app.guard';
import { ProductDetails } from 'shared-lib/components/product-details/product-details';
import { ProductSidebarCommon } from 'shared-lib/components/product-sidebar/product-sidebar';
import { CategoryCommon } from 'shared-lib/components/category/category';
import { CartCommon } from 'shared-lib/components/cart/cart';
import { Thankyou } from '../../../shared-lib/src/lib/components/thankyou/thankyou';
import { BackendPagesComponent } from '../../../shared-lib/src/lib/components/backend-pages/backend-pages';

export const routes: Routes = [
    {
        path: '',
        component: LandingPage,
        // canActivate: [authGuard]

    },
    {
        path: 'landing',
        redirectTo: '',
        component: LandingPage,

    },
    {
        path: 'login',
        component: Login,
        canActivate: [authGuard]

    },
    {
        path: 'reset-password',
        component: Login
    },

    {
        path: 'category',
        component: CategoryCommon,

    },

    {
        path: 'category-details/:id',
        component: ProductSidebarCommon,

    },

    {
        path: 'product-details/:value',
        component: ProductDetails,

    },

    {
        path: 'cart',
        component: CartCommon,

    },
    {
        path: 'user-profile',
        component: UserProfile,
        //canActivate: [authGuard]

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
        path: 'thank-you',
        component: Thankyou,

    },

  {
    path: 'category-details/:id',
    component: ProductSidebarCommon,
  },

    {
        path: 'contact-us',
        component: ContactUs,

    },

  {
    path: 'cart',
    component: CartCommon,
  },
  {
    path: 'user-profile',
    component: UserProfile,
    //canActivate: [authGuard]
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
    path: 'thank-you',
    component: Thankyou,
  },

    {
        path: '**',
        component: BackendPagesComponent,  
       resolve: { 
      pageData: PageContentResolver  
    }
    }

    //  {
    //         path: 'about-us',
    //         component: AboutUs,

    //     },
    //     {
    //         path: 'terms',
    //         component: Terms,

    //     },
    //     {
    //         path: 'privacy',
    //         component: Privacy,

    //     },



];
