//This should be loaded before loading AngularJs
//so AngularJs would be able to use jQuery instead of jqlite
import './jQueryLoader'

import 'zone.js';
import 'reflect-metadata';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { setAngularLib } from '@angular/upgrade/static';
import * as angular from 'angular';

import { AppModule } from './app.module';


setAngularLib(angular);
platformBrowserDynamic().bootstrapModule(AppModule);