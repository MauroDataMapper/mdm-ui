import { Directive, ElementRef, Injector } from '@angular/core';
import { UpgradeComponent } from "@angular/upgrade/static/static";

@Directive({
  selector: 'folder-tree-2'
})
export class ModelsDirective { 

    constructor(elementRef: ElementRef, injector: Injector) {
    
    }

}
