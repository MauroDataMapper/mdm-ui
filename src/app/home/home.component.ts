/*
Copyright 2020-2021 University of Oxford
and Health and Social Care Information Centre, also known as NHS Digital

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

SPDX-License-Identifier: Apache-2.0
*/
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { SecurityHandlerService } from '../services/handlers/security-handler.service';
import { LoginModalComponent } from '../modals/login-modal/login-modal.component';
import { ForgotPasswordModalComponent } from '../modals/forgot-password-modal/forgot-password-modal.component';
import { BroadcastService } from '../services/broadcast.service';
import { RegisterModalComponent } from '../modals/register-modal/register-modal.component';
import { MatDialog } from '@angular/material/dialog';
import { MdmResourcesService } from '@mdm/modules/resources';
import { MessageHandlerService, SharedService } from '@mdm/services';
import { catchError, takeUntil } from 'rxjs/operators';
import { ApiProperty, ApiPropertyIndexResponse } from '@maurodatamapper/mdm-resources';
import { Subject } from 'rxjs';

const defaultHtmlContent = [
  {
    key: 'content.home.intro.left',
    value: `<h3>Use the <strong>Mauro Data Mapper</strong> platform to create shared documentation for your data, and to collaborate on the definition of new data models</h3>
    <p>Automatically import your existing schemas; link, annotate and share them; use these definitions in the creation of new software components.</p>
    <p>Mauro was previously known as the Metadata Catalogue, and has been built at the University of Oxford with support from the National Institute for Health Research, and NHS Digital.</p>`
  },
  {
    key: 'content.home.intro.right',
    value: `<div class="text-center bdi--hero-header__image mt-3">
    <img src="assets/images/img.svg" alt="Mauro Data Mapper - Create, Share and Update life cycle">
</div>`
  },
  {
    key: 'content.home.detail.heading',
    value: `<h5 class="text-center marginless text-muted">Features</h5>
    <h3 class="text-center marginless">Benefits of using the Mauro Data Mapper</h3>`
  },
  {
    key: 'content.home.detail.column_one',
    value: `<div class="text-center">
    <span class="feature-icon feature-icon--1 mt-3 mb-2">
        <i class="fas fa-recycle fa-2x"></i>
    </span>
    <h4><strong>Automate</strong></h4>
    <p>
       Automatically create data models from existing artefacts, such as relational databases, Excel spreadsheets, XML Schema, or definitions in OWL or UML.  Visualise your data to check for completeness and consistency.
    </p>
</div>`
  },
  {
    key: 'content.home.detail.column_two',
    value: `<div class="text-center">
    <span class="feature-icon feature-icon--2 mt-3 mb-2">
        <i class="fas fa-balance-scale-right fa-2x"></i>
    </span>
    <h4><strong>Collaborate</strong></h4>
    <p>
        Create new models, re-using existing definitions. Manage versioning and publication lifecycles, and comment directly on parts of a model.
    </p>
</div>`
  },
  {
    key: 'content.home.detail.column_three',
    value: `<div class="text-center">
    <span class="feature-icon feature-icon--3 mt-3 mb-2">
        <i class="fas fa-cogs fa-2x"></i>
    </span>
    <h4><strong>Generate</strong></h4>
    <p>
        Create new software and configuration from existing definitions - generate forms, websites and databases - and make your documentation go further using our extensive APIs.
    </p>
</div>`
  }
];

@Component({
  selector: 'mdm-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.sass']
})
export class HomeComponent implements OnInit, OnDestroy {
  profilePictureReloadIndex = 0;
  profile: any;
  isLoggedIn = false;
  isLoadingContent = false;

  introLeftContent: string;
  introRightContent: string;
  detailHeading: string;
  detailColumn1: string;
  detailColumn2: string;
  detailColumn3: string;

  documentationUrl = this.shared.documentation.url;

  private unsubcribe$ = new Subject();

  constructor(
    public dialog: MatDialog,
    private securityHandler: SecurityHandlerService,
    private broadcast: BroadcastService,
    private resources: MdmResourcesService,
    private messageHandler: MessageHandlerService,
    private shared: SharedService,
    private title: Title
  ) {
    this.broadcast
      .onUserLoggedOut()
      .pipe(takeUntil(this.unsubcribe$))
      .subscribe(() => this.isLoggedIn = false);
  }

  ngOnInit() {
    if (this.securityHandler.isLoggedIn()) {
      this.isLoggedIn = true;
      this.profile = this.securityHandler.getCurrentUser();
    }
    this.title.setTitle('Mauro Data Mapper - Home');

    this.isLoadingContent = true;

    this.resources.apiProperties
      .listPublic()
      .pipe(
        catchError(errors => {
          this.messageHandler.showError('There was a problem getting the configuration properties.', errors);
          this.loadContent(null);
          this.isLoadingContent = false;
          return [];
        })
      )
      .subscribe((response: ApiPropertyIndexResponse) => {
        this.loadContent(response.body.items);
        this.isLoadingContent = false;
      });
  }

  ngOnDestroy(): void {
    this.unsubcribe$.next();
    this.unsubcribe$.complete();
  }

  login = () => {
    this.dialog.open(LoginModalComponent, { }).afterClosed().subscribe((user) => {
      if (user) {
        if (user.needsToResetPassword) {
          this.broadcast.userLoggedIn({ nextRoute: 'appContainer.userArea.changePassword' });
          return;
        }
        this.profile = user;
        this.broadcast.userLoggedIn({ nextRoute: 'appContainer.mainApp.twoSidePanel.catalogue.allDataModel' });
      }
    });
  };

  forgottenPassword = () => {
    this.dialog.open(ForgotPasswordModalComponent, { });
  };

  register = () => {
    this.dialog.open(RegisterModalComponent, {panelClass: 'register-modal'}).afterClosed().subscribe(user => {
      if (user) {
        if (user.needsToResetPassword) {
          this.broadcast.userLoggedIn({ nextRoute: 'appContainer.userArea.change-password' });
          return;
        }
        this.profile = user;
        this.broadcast.userLoggedIn({ nextRoute: 'appContainer.mainApp.twoSidePanel.catalogue.allDataModel' });
      }
    });
  };

  private loadContent(properties: ApiProperty[]) {
    this.introLeftContent = this.getContentProperty(properties, 'content.home.intro.left');
    this.introRightContent = this.getContentProperty(properties, 'content.home.intro.right');
    this.detailHeading = this.getContentProperty(properties, 'content.home.detail.heading');
    this.detailColumn1 = this.getContentProperty(properties, 'content.home.detail.column_one');
    this.detailColumn2 = this.getContentProperty(properties, 'content.home.detail.column_two');
    this.detailColumn3 = this.getContentProperty(properties, 'content.home.detail.column_three');
  }

  private getContentProperty(properties: ApiProperty[], key: string): string {
    return properties?.find(p => p.key === key)?.value ?? defaultHtmlContent.find(p => p.key === key).value;
  }
}
