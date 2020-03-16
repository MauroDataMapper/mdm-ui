import { Directive, ElementRef, Injector, SimpleChanges, Input } from '@angular/core';
import { UpgradeComponent } from '@angular/upgrade/static';

@Directive({
    selector: 'joint-diagram-5'
})
export class JointDiagram5Directive extends UpgradeComponent {

    @Input('mc-element') mcElement: '=';
    @Input('hide-expand') hideExpand: '=';
    @Input('diagram-name') diagramName: '=';
    @Input('min-height') minHeight: '=';
    @Input() height: '=';
    @Input() width: '=';
    @Input('grid-size') gridSize: '=';
    @Input() scale: '=';
    @Input('hide-maximize') hideMaximize: '=';
    @Input() diagram: '=';
    @Input() onElementClick: '=';

    constructor(elementRef: ElementRef, injector: Injector) {
        super('jointDiagram5', elementRef, injector);
    }
}
