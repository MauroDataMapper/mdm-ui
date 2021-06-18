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
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { SharedService } from './shared.service';
import { Observable } from 'rxjs';
import { SecurityHandlerService } from './handlers/security-handler.service';
import { mergeMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class YoutrackService {

  username: string;

  constructor(
    private httpClient: HttpClient,
    private sharedService: SharedService,
    private securityHandlerService: SecurityHandlerService) {
    this.username = securityHandlerService.getUserFromLocalStorage()?.firstName + ' ' +
      securityHandlerService.getUserFromLocalStorage()?.lastName;
  }

  reportIssue(summary: string, description: string): Observable<object> {
    // make sure youTrack is configured
    return this.getYoutrackProjectId(this.sharedService.youTrack.project)
      .pipe(
        mergeMap((data: object) => this.submitIssue(data[0].id, summary, description))
      );
  }

  getYoutrackProjectId(shortName: string): Observable<object> {
    const url = this.sharedService.youTrack.url + '/api/admin/projects?fields=id,name,shortName&query=' + encodeURIComponent(shortName);
    return this.httpClient.get(url);
  }

  submitIssue(
    projectId: string,
    summary: string,
    description: string): Observable<object> {
    const url = this.sharedService.youTrack.url + '/api/issues';

    this.username = this.securityHandlerService.getUserFromLocalStorage()?.firstName + ' ' +
      this.securityHandlerService.getUserFromLocalStorage()?.lastName;

    const body = {
      summary,
      description,
      project: {
        id: projectId
      },
      customFields: [
        {
          value: this.username,
          name: 'Reporter\'s name',
          $type: 'SimpleIssueCustomField'
        },
        {
          value: {
            name: 'Server',
            $type: 'OwnedBundleElement'
          },
          name: 'Subsystem',
          $type: 'SingleOwnedIssueCustomField'
        }
      ]
    };

    return this.httpClient.post(url, body);
  }
}
