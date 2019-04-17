import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { UpgradeModule } from '@angular/upgrade/static';
import {HeroDetailComponent} from "./js/components/hero-detail/hero-detail.component";
import { Injectable, Inject } from '@angular/core';


import moduleName from './index';
import {IRootScopeService} from "@angular/upgrade/static/src/common/angular1";


@NgModule({
    imports: [
        BrowserModule,
        UpgradeModule
    ],
    declarations: [
        HeroDetailComponent
    ],
    entryComponents:[
        HeroDetailComponent
    ],
    providers: [{
        provide: '$rootScope',
        useFactory: ($injector: any) => $injector.get('$rootScope'),
        deps: ['$injector']
    }]
})

export class AppModule {
    constructor(private upgrade: UpgradeModule){//},  @Inject("$rootScope") private $rootScope: ng.IRootScopeService, , @Inject("$state") private $state: ng.ui.IStateService) {

    }
    ngDoBootstrap() {
        this.upgrade.bootstrap(document.body, [moduleName], { strictDi: true });
    }
}


// constructor(private upgrade: UpgradeModule, @Inject("$rootScope") private $rootScope: ng.IRootScopeService, @Inject("$state") private $state: ng.ui.IStateService) {
