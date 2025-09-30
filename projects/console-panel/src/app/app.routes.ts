import { Routes } from '@angular/router';
import { PageContentResolver } from 'shared-lib';

export const routes: Routes = [
    {
        path: '',
        pathMatch: 'full',
        loadComponent: () => import('./host-outlet/host.component').then(m => m.HostOutletComponent),
        resolve: {
            pageData: PageContentResolver
        }
    },
    {
        path: 'fotobuch',  
        pathMatch: 'full',     
        loadComponent: () => import('./host-outlet/host.component').then(m => m.HostOutletComponent),
        resolve: {
            pageData: PageContentResolver
        }
    },

   
];
