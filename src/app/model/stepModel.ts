import { ComponentRef } from "@angular/core/core";

export class Step {
    constructor() {}
    title: any;
    component: any;
    hasForm = false;
    invalid: boolean;
    isProcessComplete: boolean;
    scope: any;
    compRef: ComponentRef<any>;
    active:boolean;
}