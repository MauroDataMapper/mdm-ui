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
import { BasicDiagramService } from './basic-diagram.service';
import { Injectable } from '@angular/core';
import * as joint from 'jointjs';

import { Observable, throwError } from 'rxjs';
import { DiagramParameters } from '../diagram/diagram.model';
import { CatalogueItemDomainType, ModelVersionItem, ModelVersionTreeResponse } from '@maurodatamapper/mdm-resources';

@Injectable({
  providedIn: 'root'
})
export class ModelsMergingDiagramService extends BasicDiagramService {
  parentId: string;

  // Color codes for the diagram shapes
  fontColorBlack = '#000000';
  fontColorWhite = '#ffffff';
  darkOrange = '#f27954';
  lightOrange = '#f7a900';
  shadedOrange = '#fec994';

  getDiagramContent(params: DiagramParameters): Observable<ModelVersionTreeResponse> {
    this.parentId = params.parent.id;

    switch (params.parent.domainType) {
      case CatalogueItemDomainType.DataModel:
        return this.resourcesService.dataModel.modelVersionTree(params.parent.id);
      case CatalogueItemDomainType.CodeSet:
        return this.resourcesService.codeSet.modelVersionTree(params.parent.id);
      case CatalogueItemDomainType.Terminology:
        return this.resourcesService.terminology.modelVersionTree(params.parent.id);
      case CatalogueItemDomainType.ReferenceDataModelType:
        return this.resourcesService.referenceDataModel.modelVersionTree(params.parent.id);
      case CatalogueItemDomainType.VersionedFolder:
        return this.resourcesService.versionedFolder.modelVersionTree(params.parent.id);
      default:
        return throwError(`Cannot get merge graph content for '${params.parent.domainType} ${params.parent.id}' - not supported.`);
    }
  }

  render(result: ModelVersionTreeResponse): void {
    this.changeComponent(null);

    result.body.forEach((item: ModelVersionItem) => {
      if (item.id === this.parentId) {
        this.addColoredRectangleCell(
          this.fontColorWhite,
          this.darkOrange,
          item.id,
          `${item.label} \n\n Version ${item.documentationVersion} \n\n ${item.branch} branch`,
          300,
          100,
          288
        );
      } else if (item.isNewFork) {
        this.addRectangleCell(
          item.id,
          `Fork \n\n ${item.label} \n\n  ${item.branch} branch`,
          300,
          100,
          288
        );
      } else if (item.isNewDocumentationVersion) {
        this.addColoredRectangleCell(
          this.fontColorBlack,
          this.shadedOrange,
          item.id,
          `${item.label} \n\n Version ${item.documentationVersion} \n\n ${item.branch} branch`,
          300,
          100,
          288
        );
      } else {
        if (item.modelVersion) {
          this.addColoredRectangleCell(
            this.fontColorBlack,
            this.lightOrange,
            item.id,
            `${item.label} \n\n Version ${item.modelVersion}`,
            300,
            100,
            288
          );
        } else {
          this.addColoredRectangleCell(
            this.fontColorBlack,
            this.shadedOrange,
            item.id,
            `${item.label} \n\n ${item.branch} branch`,
            300,
            100,
            288
          );
        }
      }
    });

    // Adding the links in a separate loop, because it won't find the target otherwise
    result.body.forEach((item: ModelVersionItem) => {
      let link: any;
      item.targets.forEach((itmTarget) => {
        link = new joint.shapes.standard.Link({
          id: `${item.id} _  ${itmTarget.id}`,
          source: { id: itmTarget.id },
          target: { id: item.id },
          labels: [
            {
              attrs: { text: { text: itmTarget.description } },
              position: {
                offset: 35,
                distance: 0.5
              }
            }
          ]
        });

        this.graph.addCell(link);
      });
    });
  }

  configurePaper(paper: joint.dia.Paper): void {
    paper.on('cell:pointerclick', () => {});

    paper.on('link:pointerdblclick', () => {});
  }

  canGoUp(): boolean {
    return true;
  }

  goUp(): void {}
}
