import { Directive, ElementRef, Injector, SimpleChanges, Input } from '@angular/core';
import { UpgradeComponent } from '@angular/upgrade/static';

@Directive({
    selector: 'joint-diagram-3'
})
export class JointDiagram3Directive extends UpgradeComponent {

    @Input("mc-element") mcElement: '=';
    @Input("hide-expand") hideExpand: '=';
    @Input("diagram-name") diagramName: '=';
    @Input("min-height") minHeight: '=';
    @Input() height: '=';
    @Input() width: '=';
    @Input("grid-size") gridSize: '=';
    @Input() scale: '=';
    @Input("root-cell") rootCell: '=';
    @Input() cells: '=';
    @Input() diagram: '=';

    constructor(elementRef: ElementRef, injector: Injector) {
        super('jointDiagram3', elementRef, injector);
    }
}