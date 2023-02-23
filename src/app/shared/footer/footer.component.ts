/*
Copyright 2020-2023 University of Oxford and NHS England

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
import { Component, Input } from '@angular/core';

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

@Component({
  selector: 'mdm-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent {
  /**
   * Provide a list of ordered links to other pages/websites to display in the footer.
   */
  @Input() links?: FooterLink[] = [];

  /**
   * Provide the version number to display in the footer. If not required, leave this blank.
   */
  @Input() version?: string;

  /**
   * Provide the name to use in the copyright message.
   */
  @Input() copyright?: string = 'Powered by Mauro Data Mapper.';

  year = new Date().getFullYear();
}
