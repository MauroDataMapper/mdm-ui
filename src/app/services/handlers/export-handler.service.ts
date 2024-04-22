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
import { HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  CatalogueItem,
  Exporter,
  ExportQueryParameters,
  ModelDomain
} from '@maurodatamapper/mdm-resources';
import { MdmResourcesService } from '@mdm/modules/resources';
import { Observable } from 'rxjs';
import { DomainExport } from '@maurodatamapper/mdm-resources';
import { EMPTY } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { MessageHandlerService } from '../utility/message-handler.service';

@Injectable({
  providedIn: 'root'
})
export class ExportHandlerService {
  constructor(
    private resources: MdmResourcesService,
    private messageHandler: MessageHandlerService
  ) {}

  createFileName(label: string, exporter: Exporter) {
    const extension = exporter.fileExtension ? exporter.fileExtension : 'json';
    const rightNow = new Date();
    const res = rightNow
      .toISOString()
      .slice(0, 19)
      .replace(/-/g, '')
      .replace(/:/g, '');
    // remove space from dataModelLabel and replace all spaces with _ and also add date/time and extension
    return `${label
      .trim()
      .toLowerCase()
      .split(' ')
      .join('_')}_${res}.${extension}`;
  }

  /**
   * Exports one or more models from Mauro.
   *
   * @param models One or more model identifiers to export.
   * @param exporter The exporter to use.
   * @param type The domain type to use.
   * @param options Additional options, if any, to control the export process.
   * @returns A {@link HttpResponse<ArrayBuffer>} object. The body of the response will hold the raw exported data for you to
   * write to an output source.
   */
  exportDataModel(
    models: CatalogueItem[],
    exporter: Exporter,
    type: ModelDomain,
    options?: ExportQueryParameters
  ): Observable<HttpResponse<ArrayBuffer>> {
    const ids = models.map((model) => model.id);
    const resource = this.resources.getExportableResource(type);
    const requestSettings = { responseType: 'arraybuffer' };

    if (ids.length > 1) {
      return resource.exportModels(
        exporter.namespace,
        exporter.name,
        exporter.version,
        ids,
        options,
        requestSettings
      );
    }

    const id = ids[0];
    return resource.exportModel(
      id,
      exporter.namespace,
      exporter.name,
      exporter.version,
      options,
      requestSettings
    );
  }

  createBlobLink(blob: Blob, fileName: string) {
    // http://jsbin.com/kelijatigo/edit?html,js,output
    // https://github.com/keeweb/keeweb/issues/130
    const url = (window.URL || window.webkitURL).createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', fileName);
    const linkText = document.createTextNode(fileName);
    link.appendChild(linkText);
    link.setAttribute('title', fileName);
    // DO NOT set target!!!!!
    // link.setAttribute('target', '_blank');
    return link;
  }

  downloadDomainExport(item: DomainExport) {
    this.resources.domainExports
      .download(item.id, {}, { responseType: 'arraybuffer' })
      .pipe(
        catchError((error) => {
          this.messageHandler.showError(
            'There was a problem downloading this export.',
            error
          );
          return EMPTY;
        })
      )
      .subscribe((response: HttpResponse<ArrayBuffer>) => {
        const blob = new Blob([response.body], {
          type: item.export.contentType
        });
        // Create a temporary anchor to click and trigger the browser to save the downloaded file
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', item.export.fileName);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      });
  }
}
