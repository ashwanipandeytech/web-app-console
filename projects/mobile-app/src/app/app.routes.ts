import { Routes } from '@angular/router';
import { PageContentResolver } from 'shared-lib';
import { Auth } from './auth/auth';
import { LandingPage } from './landing-page/landing-page';
import { ProductDetail } from './product-detail/product-detail';
import { Cart } from './cart/cart';
import { Category } from './category/category';
import { ProductDetailCommon} from 'shared-lib/components/product-info/product-info';
import { ProductSidebarCommon} from 'shared-lib/components/product-sidebar/product-sidebar';
import { CategoryCommon} from 'shared-lib/components/category/category';
import { CartCommon } from 'shared-lib/components/cart/cart';

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
    { path: 'category', component: Category },
    // { path: 'product-detail/:id', component: ProductDetail },
    // { path: 'cart', component: Cart },
    { path: 'cart', component: CartCommon },

 { path: 'product-details/:id', component: ProductDetailCommon },
 { path: 'product-sidebar', component: ProductSidebarCommon },
   { path: 'category',component: CategoryCommon },

 
   
];
