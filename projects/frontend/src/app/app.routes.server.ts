import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [

   { path: '', renderMode: RenderMode.Server },
  { path: 'landing', renderMode: RenderMode.Server },
  { path: 'category/**', renderMode: RenderMode.Server },
  { path: 'category-details/**', renderMode: RenderMode.Server },
  { path: 'product-details/**', renderMode: RenderMode.Server },
  {
    path: '**',
    renderMode: RenderMode.Client
  }
];
