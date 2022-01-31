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
import { Component, OnInit } from '@angular/core';
import { ApiPropertyIndexResponse } from '@maurodatamapper/mdm-resources';
import { MdmResourcesService } from '@mdm/modules/resources';
import { FeaturesService } from '@mdm/services/features.service';
import { SharedService } from '@mdm/services/shared.service';
import { catchError } from 'rxjs/operators';

const defaultFooterCopyright = 'Copyright © 2021 Clinical Informatics, NIHR Oxford Biomedical Research Centre';

@Component({
  selector: 'mdm-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent implements OnInit {
  copyright: string = defaultFooterCopyright;
  documentation = this.shared.documentation;
  issueReporting = this.shared.issueReporting;
  features: FeaturesService;

  constructor(
    private shared: SharedService,
    private resources: MdmResourcesService) { }

  ngOnInit() {
    this.features = this.shared.features;

    this.resources.apiProperties
      .listPublic()
      .pipe(
        catchError(() => {
          this.copyright = defaultFooterCopyright;
          return [];
        })
      )
      .subscribe((response: ApiPropertyIndexResponse) => {
        this.copyright = response.body.items.find(p => p.key === 'content.footer.copyright')?.value ?? defaultFooterCopyright;
      });
  }
}
