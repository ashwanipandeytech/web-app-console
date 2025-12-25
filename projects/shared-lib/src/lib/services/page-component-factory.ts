import { Injectable, Type, ViewContainerRef, Injector } from '@angular/core';
import { HeroSectionV1Component} from '../components/hero-section-v1/hero-section-v1.component';
import { CategoryComponentV1Component} from '../components/category-component-v1/category-component-v1.component';
import { ProductComponent} from '../components/product/product.component';
import { GridComponent} from '../components/grid/grid.component';
import { ProductDetails} from '../components/product-details/product-details';

// Define the component registry type for better type safety
interface ComponentRegistry {
  [key: string]: () => Promise<Type<any>>;
}

@Injectable({
  providedIn: 'root',
})
export class PageComponentFactory {
  templateWiseComponents:any={
    'Hero-Section-v1':HeroSectionV1Component,
    'Category-Component-v1':CategoryComponentV1Component,
    'ProductComponent':ProductComponent,
    'Grid-V1':GridComponent,
    'ProductDetails':ProductDetails


  }
  // private componentsRegistry: ComponentRegistry = {
  //   'Block-C-22-v1': () =>
  //     import('../components/block-c21-v1/block-c21-v1.component').then(
  //       (m) => m.blockC21v1Component // Adjust to match the actual exported component name
  //     ),
  // };

  // async loadComponentInstance(templateVersion: string, item: any, container: ViewContainerRef) {
  //   const componentToLoad = this.componentsRegistry[templateVersion];
  //   console.log('componentToLoad==>', componentToLoad, templateVersion);

  //   if (componentToLoad) {
  //     try {
  //       // Dynamically import the component class
  //       const componentClass = await componentToLoad();

  //       // // Check if the ViewContainerRef is still valid (not destroyed)
  //       // if (!container.element.nativeElement.isConnected) {
  //       //   console.warn('ViewContainerRef is disconnected from the DOM. Aborting component creation.');
  //       //   return null;
  //       // }

  //       // Use the ViewContainerRef's injector instead of EnvironmentInjector
  //       const componentRef = container.createComponent(componentClass, {
  //         injector: container.injector, // Use the injector from the ViewContainerRef
  //       });

  //       // Optionally, pass data to the component instance
  //       if (item) {
  //         Object.assign(componentRef.instance, item); // Pass data to component inputs
  //       }

  //       // Trigger change detection to ensure the component renders
  //       componentRef.changeDetectorRef.detectChanges();

  //       return componentRef; // Return the component reference if needed
  //     } catch (error) {
  //       console.error('Error loading component:', error);
  //       return null;
  //     }
  //   } else {
  //     console.warn(`No component found for templateVersion: ${templateVersion}`);
  //     return null;
  //   }
  // }

  // async getComponent(templateVersion: string): Promise<Type<any> | null> {
  //   const componentToLoad = this.componentsRegistry[templateVersion];
  //   console.log('componentToLoad==>', componentToLoad, templateVersion);

  //   if (componentToLoad) {
  //     try {
  //       const componentClass = await componentToLoad();
  //       return componentClass;
  //     } catch (error) {
  //       console.error('Error loading component:', error);
  //       return null;
  //     }
  //   } else {
  //     console.warn(`No component found for templateVersion: ${templateVersion}`);
  //     return null;
  //   }
  // }
}
