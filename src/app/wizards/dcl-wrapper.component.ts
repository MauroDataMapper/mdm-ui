import { NgModule, Output, Component, Compiler, ViewContainerRef, ViewChild, Input, ComponentRef, ComponentFactory, ComponentFactoryResolver, ChangeDetectorRef, EventEmitter } from '@angular/core'

// Helper component to add dynamic components
@Component({
    selector: 'dcl-wrapper',
    template: `<div  #target></div>`
})
export class DclWrapper {
    @ViewChild('target', { read: ViewContainerRef, static: false }) target;
    @Input() type;

    stepVal: any;

    @Output() stepChanged = new EventEmitter<any>();
    @Input()
    get step() {
        return this.stepVal;
    };
    set step(val) {
        this.stepVal = val;
        this.stepChanged.emit();
    }

    private isViewInitialized: boolean = false;

    constructor(private componentFactoryResolver: ComponentFactoryResolver, private cdRef: ChangeDetectorRef) { }

    updateComponent() {
        if (!this.isViewInitialized) {
            return;
        }
        if (this.step.compRef) {
            this.step.compRef.destroy();
        }

        let factory = this.componentFactoryResolver.resolveComponentFactory(this.type);
        this.step.compRef = this.target.createComponent(factory);
        this.step.compRef.instance.step = this.step;
        // to access the created instance use
        // this.compRef.instance.someProperty = 'someValue';
        // this.compRef.instance.someOutput.subscribe(val => doSomething());

        this.cdRef.detectChanges();
    }

    ngOnChanges() {
        this.updateComponent();
    }

    ngAfterViewInit() {
        
        this.isViewInitialized = true;
        this.updateComponent();
    }

    ngOnDestroy() {
        if (this.step.compRef) {
            this.step.compRef.destroy();
        }
    }
}