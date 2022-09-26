/*
Copyright 2020-2022 University of Oxford
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
import {Component, OnInit} from '@angular/core';
import {Observable} from 'rxjs';
import {ApiProperty, ApiPropertyIndexResponse} from '../../../../mdm-resources';
import {catchError, map} from 'rxjs/operators';
import {MdmResourcesService} from '@mdm/modules/resources';
import {FeaturesService} from '@mdm/services/features.service';
import {SharedService} from '@mdm/services';

/**
 * Define the details for a link in the layout and navigation components.
 */
export interface FooterLink {
  /**
   * The display label to apply to the link.
   */
  label: string;

  /**
   * If this is a hyperlink, provide the href for the anchor tag.
   *
   * @see {@link routerLink}
   */
  href?: string;

  /**
   * If this is a router link to another component, provide the route name to transition to.
   *
   * @see {@link href}
   */
  routerLink?: string;

  /**
   * State the target to use on the anchor tag.
   */
  target?: '_blank' | '_self';
}

const defaultCopyright =
  'Clinical Informatics, NIHR Oxford Biomedical Research Centre';

@Component({
  selector: 'mdm-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})

export class FooterComponent implements OnInit {

  year = new Date().getFullYear();
  footerLinks: FooterLink[] = [];
  appVersion?: string;
  copyright?: string;

  constructor(
    private shared: SharedService,
    private resources: MdmResourcesService,
    private features: FeaturesService
  ) {}


  ngOnInit(): void {
    this.setupFooter();
  }

  private setupFooter() {
    const request$: Observable<ApiPropertyIndexResponse> = this.resources.apiProperties.listPublic();

    request$
      .pipe(
        catchError(() => []),
        map((response: ApiPropertyIndexResponse) => response.body.items),
        map((apiProperties: ApiProperty[]) => {
          return {
            copyright: apiProperties.find(
              (p) => p.key === 'content.footer.copyright'
            ),
            documentationUrl: this.shared.documentation?.url,
            issueReportingUrl:
              this.features.useIssueReporting &&
              this.shared.issueReporting?.defaultUrl
          };
        })
      )
      .subscribe((config) => {
        if (config.documentationUrl) {
          this.footerLinks.push({
            label: 'Mauro Documentation',
            href: config.documentationUrl,
            target: '_blank'
          });
        }

        if (config.issueReportingUrl) {
          this.footerLinks.push({
            label: 'Report an issue or request a feature',
            href: config.issueReportingUrl,
            target: '_blank'
          });
        }

        this.appVersion = this.shared.appVersion;
        this.copyright = config.copyright?.value ?? defaultCopyright;
      });
  }

}
