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
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { MdmResourcesService } from '@mdm/modules/resources';
import { ValidatorService } from '../services/validator.service';
import { MessageHandlerService } from '../services/utility/message-handler.service';
import { StateService } from '@uirouter/core';
import { Observable } from 'rxjs';

@Component({
  selector: 'mdm-model-comparison',
  templateUrl: './model-comparison.component.html',
  styleUrls: ['./model-comparison.component.scss']
})
export class ModelComparisonComponent implements OnInit {
  diffMap = {};
  diffMapLeft = {};
  diffMapRight = {};
  max = 100;
  dynamic = 100;
  diffs: any;
  processing: boolean;
  activeTab: any;

  diffElements = ['dataClasses', 'dataElements', 'dataTypes'];
  diffProps = ['label', 'description', 'author', 'organisation'];

  sourceModel: any;
  targetModel: any;

  form = {
    dataTypeFilter: null,
    dataElementFilter: null
  };

  constructor(
    private messageHandler: MessageHandlerService,
    private validator: ValidatorService,
    private resources: MdmResourcesService,
    private stateService: StateService,
    private changeDetector: ChangeDetectorRef
  ) { }

  /* eslint-disable no-shadow */
  async ngOnInit() {
    // tslint:disable-next-line: deprecation
    const sourceId = this.stateService.params.sourceId;
    // tslint:disable-next-line: deprecation
    const targetId = this.stateService.params.targetId;

    if (sourceId) {
      this.sourceModel = await this.loadDataModelDetail(sourceId);
    }

    if (targetId) {
      this.targetModel = await this.loadDataModelDetail(targetId);
    }

    if (this.sourceModel && this.targetModel) {
      // check if source and target need to be swapped
      if (this.checkIfSwapNeeded()) {
        this.swap();
      }

      this.runDiff();
    }
  }

  checkIfSwapNeeded = () => {
    let swapNeeded = false;
    for (
      let i = 0;
      this.sourceModel.semanticLinks &&
      i < this.sourceModel.semanticLinks.length;
      i++
    ) {
      const link = this.sourceModel.semanticLinks[i];
      if (
        link.linkType === 'New Version Of' &&
        link.target.id === this.targetModel.id
      ) {
        swapNeeded = true;
      }
    }
    for (
      let i = 0;
      this.targetModel.semanticLinks &&
      i < this.targetModel.semanticLinks.length;
      i++
    ) {
      const link = this.targetModel.semanticLinks[i];
      if (
        link.linkType === 'Superseded By' &&
        link.target.id === this.sourceModel.id
      ) {
        swapNeeded = true;
      }
    }
    return swapNeeded;
  };

  async loadDataModelDetail(modelId) {
    if (!modelId) {
      return null;
    }

    const response = await this.resources.dataModel.get(modelId).toPromise();
    const model = response.body;
    const children = await this.resources.tree.get('dataModels', model.domainType, model.id).toPromise();
    model.children = children.body;
    if (model.children?.length > 0) {
      model.hasChildren = true;
    }
    return model;
  }

  async onModelSelect(selected, side) {
    const selectedId = Array.isArray(selected) ? selected[0]?.id : selected?.id;
    if (!selectedId) {
      if (side === 'left') {
        this.sourceModel = null;
      } else if (side === 'right') {
        this.targetModel = null;
      }
      this.diffs = [];
      return;
    }

    if (side === 'left') {
      this.sourceModel = await this.loadDataModelDetail(selectedId);
      this.targetModel = await this.loadDataModelDetail(this.targetModel?.id);
    } else if (side === 'right') {
      this.sourceModel = await this.loadDataModelDetail(this.sourceModel?.id);
      this.targetModel = await this.loadDataModelDetail(selectedId);
    }

    if (this.sourceModel && this.targetModel) {
      this.runDiff();
    }
  }

  swap() {
    const tmp = this.sourceModel;
    this.sourceModel = this.targetModel;
    this.targetModel = tmp;
    this.runDiff();
  }

  modifiedParents = (breadcrumbs, diffMap) => {
    if (!breadcrumbs) {
      return;
    }
    breadcrumbs.forEach((element) => {
      this.initDiff(element.id, diffMap);

      // Not deleted & Not modified -> modified
      if (!diffMap[element.id].deleted && !diffMap[element.id].created) {
        diffMap[element.id].modified = true;
        diffMap[element.id].deleted = false;
        diffMap[element.id].created = false;
      }
    });
  };
  initDiff = (id, diffMap) => {
    if (diffMap[id]) {
      return;
    }
    diffMap[id] = {
      id,
      diffs: {
        properties: [],
        metadata: [],
        enumerationValues: [],

        dataTypes: [],
        dataClasses: [],
        dataElements: []
      }
    };
  };

  findDiffDataTypeChanges = (leftId, rightId, dataTypeDiff, diffMap) => {
    this.initDiff(leftId, diffMap);
    this.initDiff(rightId, diffMap);
    diffMap[leftId].modified = true;
    diffMap[rightId].modified = true;

    const update = {
      property: 'dataType',
      title: 'DataType',
      left: dataTypeDiff.left,
      right: dataTypeDiff.right
    };
    diffMap[leftId].diffs.properties.push(update);
    diffMap[rightId].diffs.properties.push(update);
  };

  findDiffProps = (propName, leftId, rightId, labelDiff, diffMap) => {
    this.initDiff(leftId, diffMap);
    this.initDiff(rightId, diffMap);
    diffMap[leftId].modified = true;
    diffMap[rightId].modified = true;

    const update = {
      property: propName,
      title: this.validator.capitalize(propName),
      left:
        !labelDiff.left || labelDiff.left === 'null' ? '\' \'' : labelDiff.left,
      right:
        !labelDiff.right || labelDiff.right === 'null' ? '\' \'' : labelDiff.right
    };

    diffMap[leftId].diffs.properties.push(update);
    diffMap[rightId].diffs.properties.push(update);
  };

  findDiffMetadata = (leftId, rightId, metadataDiff, diffMap) => {
    this.initDiff(leftId, diffMap);
    this.initDiff(rightId, diffMap);
    diffMap[leftId].modified = true;
    diffMap[rightId].modified = true;

    if (metadataDiff.created) {
      metadataDiff.created.forEach(item => {

        const created = item.value ?? item;
        created.created = true;
        diffMap[leftId].diffs.metadata.push(created);
        diffMap[rightId].diffs.metadata.push(created);
      });
    }
    if (metadataDiff.deleted) {
       metadataDiff.deleted.forEach(item => {

        const deleted = item.value ?? item;
        deleted.deleted = true;
        diffMap[leftId].diffs.metadata.push(deleted);
        diffMap[rightId].diffs.metadata.push(deleted);
      });
    }
    if (metadataDiff.modified) {
      metadataDiff.modified.forEach(modified => {
        const update = {
          leftId: modified.leftId,
          rightId: modified.rightId,
          key: modified.key,
          namespace: modified.namespace,
          property: 'value',
          left: modified.diffs[0].value.left,
          right: modified.diffs[0].value.right,
          modified: true
        };
        diffMap[leftId].diffs.metadata.push(update);
        diffMap[rightId].diffs.metadata.push(update);
      });
    }
  };

  findDiffEnumerationValues = (
    leftId,
    rightId,
    enumerationValuesDiff,
    diffMap
  ) => {
    this.initDiff(leftId, diffMap);
    this.initDiff(rightId, diffMap);
    diffMap[leftId].modified = true;
    diffMap[rightId].modified = true;

    if (enumerationValuesDiff.created) {
      enumerationValuesDiff.created.forEach(item => {

        const created = item.value ?? item;
        created.created = true;
        diffMap[leftId].diffs.enumerationValues.push(created);
        diffMap[rightId].diffs.enumerationValues.push(created);
      });
    }
    if (enumerationValuesDiff.deleted) {
      enumerationValuesDiff.deleted.forEach(item => {

        const deleted = item.value ?? item;
        deleted.deleted = true;
        diffMap[leftId].diffs.enumerationValues.push(deleted);
        diffMap[rightId].diffs.enumerationValues.push(deleted);
      });
    }

    if (enumerationValuesDiff.modified) {
      enumerationValuesDiff.modified.forEach(modified => {
        const update = {
          leftId: modified.leftId,
          rightId: modified.rightId,
          label: modified.label,
          property: 'value',
          left: modified.diffs[0].value.left,
          right: modified.diffs[0].value.right,
          modified: true
        };
        diffMap[leftId].diffs.enumerationValues.push(update);
        diffMap[rightId].diffs.enumerationValues.push(update);
      });
    }
  };

  runDiff = () => {
    if (!this.sourceModel || !this.targetModel) {
      return;
    }

    this.diffMap = {};
    this.diffs = [];
    this.processing = true;

    this.resources.dataModel.diff(this.sourceModel.id, this.targetModel.id)
      .subscribe(
        res => {
          this.processing = false;
          const result = res.body;

          const diffMap = {};

          // Run for DataModel
          result.diffs.forEach(diff => {
            if (diff.label) {
              this.findDiffProps(
                'label',
                result.leftId,
                result.rightId,
                diff.label,
                diffMap
              );
            }
            if (diff.description) {
              this.findDiffProps(
                'description',
                result.leftId,
                result.rightId,
                diff.description,
                diffMap
              );
            }
            if (diff.author) {
              this.findDiffProps(
                'author',
                result.leftId,
                result.rightId,
                diff.author,
                diffMap
              );
            }
            if (diff.organisation) {
              this.findDiffProps(
                'organisation',
                result.leftId,
                result.rightId,
                diff.organisation,
                diffMap
              );
            }

            if (diff.metadata) {
              this.findDiffMetadata(
                result.leftId,
                result.rightId,
                diff.metadata,
                diffMap
              );
            }
          });

          result.diffs.forEach(diff => {
            this.diffElements.forEach(diffElement => {
              if (!diff[diffElement]) {
                return;
              }

            diff[diffElement].created?.forEach(item => {
                const el = item.value ?? item;
                this.initDiff(el.id, diffMap);
                diffMap[el.id].id = el.id;
                diffMap[el.id].created = true;
                diffMap[el.id].deleted = false;
                diffMap[el.id].modified = false;

                if (diffElement === 'dataClasses') {
                  this.modifiedParents(el.breadcrumbs, diffMap);
                }

                if (diffElement === 'dataElements' && el.breadcrumbs) {
                  this.modifiedParents(el.breadcrumbs, diffMap);

                  const parentDC = el.breadcrumbs[el.breadcrumbs.length - 1];
                  this.initDiff(parentDC.id, diffMap);
                  el.created = true;
                  el.modified = false;
                  el.deleted = false;
                  el.domainType = 'DataElement';
                  diffMap[parentDC.id].diffs.dataElements.push(el);
                }

                if (diffElement === 'dataTypes') {
                  this.modifiedParents([{ id: this.sourceModel.id }], diffMap);
                  this.modifiedParents([{ id: this.targetModel.id }], diffMap);

                  this.initDiff(this.sourceModel.id, diffMap);
                  this.initDiff(this.targetModel.id, diffMap);

                  el.created = true;
                  el.modified = false;
                  el.deleted = false;
                  el.domainType = 'DataType';

                  diffMap[this.sourceModel.id].diffs.dataTypes.push(el);
                  diffMap[this.targetModel.id].diffs.dataTypes.push(el);
                }
              });

              diff[diffElement].deleted?.forEach(item => {
                const el = item.value ?? item;
                this.initDiff(el.id, diffMap);
                diffMap[el.id].id = el.id;
                diffMap[el.id].deleted = true;
                diffMap[el.id].created = false;
                diffMap[el.id].modified = false;

                if (diffElement === 'dataClasses') {
                  if (el.breadcrumbs) {
                    this.modifiedParents(
                      el.breadcrumbs.slice(0, el.breadcrumbs.length - 1),
                      diffMap
                    );
                  }
                }
                if (diffElement === 'dataElements' && el.breadcrumbs) {
                  this.modifiedParents(el.breadcrumbs, diffMap);

                  const parentDC = el.breadcrumbs[el.breadcrumbs.length - 1];
                  this.initDiff(parentDC.id, diffMap);
                  el.deleted = true;
                  el.created = false;
                  el.modified = false;
                  el.domainType = 'DataElement';
                  diffMap[parentDC.id].diffs.dataElements.push(el);
                }

                if (diffElement === 'dataTypes') {
                  this.modifiedParents([{ id: this.sourceModel.id }], diffMap);
                  this.modifiedParents([{ id: this.targetModel.id }], diffMap);

                  this.initDiff(this.sourceModel.id, diffMap);
                  this.initDiff(this.targetModel.id, diffMap);
                  el.deleted = true;
                  el.created = false;
                  el.modified = false;
                  el.domainType = 'DataType';
                  diffMap[this.sourceModel.id].diffs.dataTypes.push(el);
                  diffMap[this.targetModel.id].diffs.dataTypes.push(el);
                }
              });

               diff[diffElement].modified?.forEach(item => {

                  const el = item.value ?? item;
                this.initDiff(el.leftId, diffMap);
                diffMap[el.leftId].modified = true;
                diffMap[el.leftId].id = el.leftId;

                this.initDiff(el.rightId, diffMap);
                diffMap[el.rightId].modified = true;
                diffMap[el.rightId].id = el.rightId;

                if (diffElement === 'dataClasses') {
                  if (el.leftBreadcrumbs) {
                    this.modifiedParents(
                      el.leftBreadcrumbs.slice(
                        0,
                        el.leftBreadcrumbs.length - 1
                      ),
                      diffMap
                    );
                  }
                  if (el.rightBreadcrumbs) {
                    this.modifiedParents(
                      el.rightBreadcrumbs.slice(
                        0,
                        el.rightBreadcrumbs.length - 1
                      ),
                      diffMap
                    );
                  }
                }

                if (diffElement === 'dataElements' && el.leftBreadcrumbs) {
                  this.modifiedParents(el.leftBreadcrumbs, diffMap);

                  const parentDC =
                    el.leftBreadcrumbs[el.leftBreadcrumbs.length - 1];
                  this.initDiff(parentDC.id, diffMap);
                  el.modified = true;
                  el.created = false;
                  el.deleted = false;
                  el.domainType = 'DataElement';
                  diffMap[parentDC.id].diffs.dataElements.push(el);
                }

                if (diffElement === 'dataElements' && el.rightBreadcrumbs) {
                  this.modifiedParents(el.rightBreadcrumbs, diffMap);

                  const parentDC =
                    el.rightBreadcrumbs[el.rightBreadcrumbs.length - 1];
                  this.initDiff(parentDC.id, diffMap);
                  el.modified = true;
                  el.created = false;
                  el.deleted = false;
                  el.domainType = 'DataElement';
                  diffMap[parentDC.id].diffs.dataElements.push(el);
                }

                if (diffElement === 'dataTypes' && el.leftBreadcrumbs) {
                  this.modifiedParents(el.leftBreadcrumbs, diffMap);

                  const parentDM = el.leftBreadcrumbs[0];
                  this.initDiff(parentDM.id, diffMap);
                  el.modified = true;
                  el.deleted = false;
                  el.created = false;
                  el.domainType = 'DataType';
                  diffMap[parentDM.id].diffs.dataTypes.push(el);
                }

                if (diffElement === 'dataTypes' && el.rightBreadcrumbs) {
                  this.modifiedParents(el.rightBreadcrumbs, diffMap);

                  const parentDM = el.rightBreadcrumbs[0];
                  this.initDiff(parentDM.id, diffMap);
                  el.modified = true;
                  el.deleted = false;
                  el.created = false;
                  el.domainType = 'DataType';
                  diffMap[parentDM.id].diffs.dataTypes.push(el);
                }

                // Run for Element
                // tslint:disable-next-line: no-shadowed-variable
                el.diffs.forEach(elemDiff => {
                  if (elemDiff.label) {
                    this.findDiffProps(
                      'label',
                      el.leftId,
                      el.rightId,
                      elemDiff.label,
                      diffMap
                    );
                  }
                  if (elemDiff.description) {
                    this.findDiffProps(
                      'description',
                      el.leftId,
                      el.rightId,
                      elemDiff.description,
                      diffMap
                    );
                  }
                  if (elemDiff.author) {
                    this.findDiffProps(
                      'author',
                      el.leftId,
                      el.rightId,
                      elemDiff.author,
                      diffMap
                    );
                  }
                  if (elemDiff.organisation) {
                    this.findDiffProps(
                      'organisation',
                      el.leftId,
                      el.rightId,
                      elemDiff.organisation,
                      diffMap
                    );
                  }
                  if (elemDiff.minMultiplicity) {
                    this.findDiffProps(
                      'minMultiplicity',
                      el.leftId,
                      el.rightId,
                      elemDiff.minMultiplicity,
                      diffMap
                    );
                  }
                  if (elemDiff.maxMultiplicity) {
                    this.findDiffProps(
                      'maxMultiplicity',
                      el.leftId,
                      el.rightId,
                      elemDiff.maxMultiplicity,
                      diffMap
                    );
                  }

                  if (elemDiff.metadata) {
                    this.findDiffMetadata(
                      el.leftId,
                      el.rightId,
                      elemDiff.metadata,
                      diffMap
                    );
                  }

                  if (diffElement === 'dataTypes' && elemDiff.enumerationValues) {
                    this.findDiffEnumerationValues(
                      el.leftId,
                      el.rightId,
                      elemDiff.enumerationValues,
                      diffMap
                    );
                  }

                  if (
                    diffElement === 'dataElements' &&
                    elemDiff['dataType.label']
                  ) {
                    this.findDiffDataTypeChanges(
                      el.leftId,
                      el.rightId,
                      elemDiff['dataType.label'],
                      diffMap
                    );
                  }
                });
              });
            });
          });
          this.diffMap = diffMap;
          if (this.diffMap[this.sourceModel.id]) {
            this.sourceModel.modified = this.diffMap[
              this.sourceModel.id
            ].modified;
          }

          if (this.diffMap[this.targetModel.id]) {
            this.targetModel.modified = this.diffMap[
              this.targetModel.id
            ].modified;
          }

          this.sourceModel.children.forEach(dc => {
            if (this.diffMap[dc.id]) {
              dc.deleted = this.diffMap[dc.id].deleted;
              dc.created = this.diffMap[dc.id].created;
              dc.modified = this.diffMap[dc.id].modified;
            }
          });

          this.targetModel.children.forEach(dc => {
            if (this.diffMap[dc.id]) {
              dc.deleted = this.diffMap[dc.id].deleted;
              dc.created = this.diffMap[dc.id].created;
              dc.modified = this.diffMap[dc.id].modified;
            }
          });

          this.onNodeClick(this.sourceModel);
        },
        error => {
          this.messageHandler.showError(
            'There was a problem comparing the Data Models.',
            error
          );
          this.processing = false;
        }
      );
  };

  onNodeExpand = node => {
    const obs = new Observable(sub => {
      this.resources.tree.get('dataModels', node.domainType, node.id).subscribe(res => {
          const result = res.body;
          result.forEach(dc => {
            if (this.diffMap[dc.id]) {
              dc.deleted = this.diffMap[dc.id].deleted;
              dc.created = this.diffMap[dc.id].created;
              dc.modified = this.diffMap[dc.id].modified;
            }
          });
          sub.next(result);
        });
    });
    return obs;
  };

  onNodeClick = node => {
    this.diffs = [];
    if (!this.diffMap[node.id]) {
      return;
    }
    this.diffs = this.diffMap[node.id].diffs;

    this.diffs.filteredDataTypes = Object.assign([], this.diffs.dataTypes);
    this.diffs.dataTypesStatus = {
      deleted: 0,
      created: 0,
      modified: 0
    };
    this.diffs.dataTypes.forEach(value => {
      if (value.deleted) {
        this.diffs.dataTypesStatus.deleted++;
      }
      if (value.created) {
        this.diffs.dataTypesStatus.created++;
      }
      if (value.modified) {
        this.diffs.dataTypesStatus.modified++;
      }
    });

    this.diffs.filteredDataElements = Object.assign(
      [],
      this.diffs.dataElements
    );
    this.diffs.dataElementsStatus = {
      deleted: 0,
      created: 0,
      modified: 0
    };
    this.diffs.dataElements.forEach(value => {
      if (value.deleted) {
        this.diffs.dataElementsStatus.deleted++;
      }
      if (value.created) {
        this.diffs.dataElementsStatus.created++;
      }
      if (value.modified) {
        this.diffs.dataElementsStatus.modified++;
      }
    });

    this.form = {
      dataTypeFilter: null,
      dataElementFilter: null
    };

    this.activeTab = { index: 0 };

    if (this.diffs.properties.length > 0) {
      this.activeTab.index = 0;
    } else if (this.diffs.metadata.length > 0) {
      this.activeTab.index = 1;
    } else if (this.diffs.dataTypes.length > 0) {
      this.activeTab.index = 2;
    } else if (this.diffs.dataElements.length > 0) {
      this.activeTab.index = 3;
    }
  };

  dataElementFilterChange = () => {
    if (this.diffs.dataElements && this.diffs.dataElements.length > 0) {
      if (!this.form.dataElementFilter) {
        this.diffs.filteredDataElements = Object.assign(
          [],
          this.diffs.dataElements
        );
        return;
      }

      this.diffs.filteredDataElements = this.diffs.dataElements.filter(dataType => {
        return (this.form.dataElementFilter === 'deleted' && dataType.deleted) ||
          (this.form.dataElementFilter === 'created' && dataType.created) ||
          (this.form.dataElementFilter === 'modified' && dataType.modified);
      });
    }
  };

  dataTypeFilterChange = () => {
    if (this.diffs.dataTypes && this.diffs.dataTypes.length > 0) {
      if (!this.form.dataTypeFilter) {
        this.diffs.filteredDataTypes = Object.assign([], this.diffs.dataTypes);
        return;
      }

      this.diffs.filteredDataTypes = this.diffs.dataTypes.filter(dataType => {
        return (this.form.dataTypeFilter === 'deleted' && dataType.deleted) ||
          (this.form.dataTypeFilter === 'created' && dataType.created) ||
          (this.form.dataTypeFilter === 'modified' && dataType.modified);
      }
      );
    }
  };
}
