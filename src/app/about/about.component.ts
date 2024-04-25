/*
Copyright 2020-2024 University of Oxford and NHS England

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
import { Component, OnInit } from '@angular/core';
import { SharedService } from '../services/shared.service';
import { MdmResourcesService } from '@mdm/modules/resources';
import { MessageHandlerService } from '@mdm/services';
import { catchError } from 'rxjs/operators';
import { ApiProperty, ApiPropertyIndexResponse } from '@maurodatamapper/mdm-resources';
import { Title } from '@angular/platform-browser';

const defaultHtmlContent = [
  {
    key: 'content.about.application.name',
    value: 'Mauro Data Mapper'
  },
  {
    key: 'content.about.content',
    value: `<p>The Mauro Data Mapper (a.k.a. the Oxford Metadata Catalogue) is used to develop and maintain linked, versioned
          descriptions of data standards, datasets, and questionnaires.  These descriptions capture essential structure and
          context together with a detailed account of each variable, comprising: name, natural language definition, data type,
          and multiplicity.  A data type may be a primitive type with units (such a height in metres) or an enumeration,
          complete with an explanation of the intended meaning of each value (such as 1 = male, 2 = female). </p>
       <p><img style="float: right; width: 40%; margin-left: 1em;" src="assets/images/SummaryMetadata.png" alt="Example summary metadata distribution graph"></p>
       <p>The explicit treatment of structure means that common aspects of variable definitions can be factorized for
          scalability: that is, introduced at the level of an enclosing data class, table, or form section.  Descriptions
          of variables, and descriptions of these component structures, can be linked to indicate semantic relationships
          between them: most often, the existence of mappings and/or conversions that allow one variable, or one component
          to be used in place of another (semantic interoperability). </p>
       <p>Descriptions and links are managed as components of data models.  Each model in the catalogue will correspond to a
          particular artefact: for example, a data standard, a data extract, or a form design.  There may be more than one
          model of the same artefact, reflecting different perspectives and/or purposes: for example, a link indicating
          semantic interoperability might be valid for some purposes but not for others.  The catalogue supports
          contextualised (even apparently inconsistent) and evolving viewpoints.   </p>
       <p><img style="float: left; width: 40%; margin-right: 1em;" src="assets/images/UMLChart.png" alt=""Example UML diagram></p>
       <p>This support for multiple perspectives adds to the scalability of the approach: descriptions and definitions can be
          contributed by many parties, without the need for prior reconciliation.  Users of the catalogue can choose which
          models, and which descriptions and links, to build upon.  In most cases, they will make this choice based upon
          model authorship or provenance, and choices can be automated.  Other tools may be used to automate the production
          of models from artefacts and - conversely - the generation of artefacts (for example, forms, or queries for data
          extracts) from models already in the catalogue.</p>
    `
  },
  {
    key: 'content.about.contact.details',
    value: 'For more details, please contact us via email: <a href="mailto:info@metadata-catalogue.org">info@metadata-catalogue.org</a>'
  }
];

@Component({
  selector: 'mdm-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.sass']
})
export class AboutComponent implements OnInit {

  isLoadingContent = false;

  applicationName: string;
  content: string;
  contactDetails: string;

  public appVersion: string;
  constructor(
      private shared: SharedService,
      private title: Title,
      private resources: MdmResourcesService,
      private messageHandler: MessageHandlerService,) { }

  ngOnInit() {
    this.appVersion = this.shared.appVersion;
    this.title.setTitle('About');
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

  private loadContent(properties: ApiProperty[]) {
    this.applicationName = this.getContentProperty(properties, 'content.about.application.name');
    this.content = this.getContentProperty(properties, 'content.about.content');
    this.contactDetails = this.getContentProperty(properties, 'content.about.contact.details');
  }

  private getContentProperty(properties: ApiProperty[], key: string): string {
    return properties?.find(p => p.key === key)?.value ?? defaultHtmlContent.find(p => p.key === key).value;
  }
}
